import { currentUser } from "../../../../lib/auth";
import { supabaseAdmin } from "../../../../lib/supabase";
export async function GET(req:Request){const {count}=await supabaseAdmin().from("profiles").select("id",{count:"exact",head:true});return Response.json({needsSetup:!count,user:await currentUser(req)})}
