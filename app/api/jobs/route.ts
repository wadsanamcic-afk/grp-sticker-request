import { requireUser } from "../../../lib/auth";
import { camelJob, supabaseAdmin } from "../../../lib/supabase";

const MAX_ITEMS = 10;
const MAX_SUBMISSIONS_PER_HOUR = 10;
const clean = (value: unknown, max: number) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

async function hashIp(ip: string) {
  const salt = process.env.SUPABASE_SECRET_KEY ?? "";
  const bytes = new TextEncoder().encode(`${ip}:${salt.slice(-24)}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
}

async function allowSubmission(req: Request) {
  const requestUrl = new URL(req.url);
  const origin = req.headers.get("origin");
  if (!origin || origin !== requestUrl.origin) return false;
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const ipHash = await hashIp(ip);
  const db = supabaseAdmin();
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count, error } = await db
    .from("submission_attempts")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("created_at", since);
  if (error || (count ?? 0) >= MAX_SUBMISSIONS_PER_HOUR) return false;
  const attempt = await db.from("submission_attempts").insert({ ip_hash: ipHash });
  return !attempt.error;
}

export async function GET(req: Request) {
  if (!(await requireUser(req)))
    return Response.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
  const { data, error } = await supabaseAdmin()
    .from("jobs")
    .select("*,job_items(*)")
    .order("created_at", { ascending: false })
    .limit(100);
  return error
    ? Response.json({ error: error.message }, { status: 500 })
    : Response.json({ jobs: (data ?? []).map(camelJob) });
}

export async function POST(req: Request) {
  try {
    if (!(await allowSubmission(req)))
      return Response.json(
        { error: "ส่งคำขอถี่เกินไปหรือแหล่งที่มาไม่ถูกต้อง กรุณารอสักครู่" },
        { status: 429 },
      );

    const x = (await req.json()) as Record<string, unknown>;
    const documentNo = clean(x.documentNo, 32).toUpperCase();
    const requester = clean(x.requester, 120);
    const department = clean(x.department, 120);
    const priority = clean(x.priority, 80);
    const deliveryChannel = clean(x.deliveryChannel, 10);
    const deliveryContact = clean(x.deliveryContact, 200);
    const startDate = clean(x.startDate, 10);
    const dueFrom = clean(x.dueFrom, 10);
    const dueTo = clean(x.dueTo, 10);
    const totalQty = Number(x.totalQty);
    const items = Array.isArray(x.items)
      ? (x.items as Record<string, unknown>[]).slice(0, MAX_ITEMS)
      : [];
    const validDate = /^\d{4}-\d{2}-\d{2}$/;

    if (
      !/^GRP-\d{8}-\d{3}$/.test(documentNo) ||
      !requester ||
      !department ||
      !priority ||
      !validDate.test(startDate) ||
      !validDate.test(dueFrom) ||
      !validDate.test(dueTo) ||
      !["LINE", "Email"].includes(deliveryChannel) ||
      !deliveryContact ||
      !Number.isInteger(totalQty) ||
      totalQty < 1 ||
      totalQty > 1_000_000 ||
      items.length < 1
    )
      return Response.json(
        { error: "ข้อมูลคำขอไม่ครบหรือไม่ถูกต้อง" },
        { status: 400 },
      );

    const rows = items.map((item, index) => {
      const quantity = Number(item.qty);
      const width = Number(item.w);
      const height = Number(item.h);
      const row = {
        position: index + 1,
        type: clean(item.type, 80),
        type_other: clean(item.typeOther, 160) || null,
        title: clean(item.title, 200),
        material: clean(item.material, 120) || null,
        copy_text: clean(item.copy, 5000),
        width,
        height,
        unit: clean(item.unit, 20) || "ซม.",
        print_required: Boolean(item.print),
        quantity,
        note: clean(item.note, 2000) || null,
        reference_link: clean(item.referenceLink, 1000) || null,
      };
      if (
        !row.type ||
        !row.title ||
        !row.copy_text ||
        !Number.isFinite(width) ||
        width < 0 ||
        !Number.isFinite(height) ||
        height < 0 ||
        !Number.isInteger(quantity) ||
        quantity < 1 ||
        quantity > 1_000_000
      )
        throw new Error("รายละเอียดชิ้นงานไม่ครบหรือไม่ถูกต้อง");
      return row;
    });

    const db = supabaseAdmin();
    const { data: job, error } = await db
      .from("jobs")
      .insert({
        document_no: documentNo,
        requester,
        department,
        priority,
        start_date: startDate,
        due_from: dueFrom,
        due_to: dueTo,
        purpose: clean(x.purpose, 2000),
        total_qty: totalQty,
        delivery_channel: deliveryChannel,
        delivery_contact: deliveryContact,
      })
      .select()
      .single();
    if (error) throw error;

    const itemInsert = await db
      .from("job_items")
      .insert(rows.map((row) => ({ ...row, job_id: job.id })));
    if (itemInsert.error) {
      await db.from("jobs").delete().eq("id", job.id);
      throw itemInsert.error;
    }
    return Response.json(
      { job: camelJob({ ...job, job_items: rows }) },
      { status: 201 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "บันทึกงานไม่สำเร็จ";
    const duplicate =
      message.includes("duplicate key") ||
      message.includes("jobs_document_no_key");
    return Response.json(
      {
        error: duplicate
          ? "เลขที่เอกสารนี้ถูกส่งแล้ว กรุณารีเฟรชหน้าและลองใหม่"
          : message,
      },
      { status: duplicate ? 409 : 500 },
    );
  }
}
