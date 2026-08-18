import { createClient } from "@supabase/supabase-js";

const url=process.env.SUPABASE_URL!;
const publishable=process.env.SUPABASE_PUBLISHABLE_KEY!;
const secret=process.env.SUPABASE_SECRET_KEY!;

export const supabaseAdmin=()=>createClient(url,secret,{auth:{persistSession:false,autoRefreshToken:false}});
export const supabasePublic=()=>createClient(url,publishable,{auth:{persistSession:false,autoRefreshToken:false}});

export const camelJob=(j:Record<string,unknown>)=>({
 id:j.id,documentNo:j.document_no,requester:j.requester,department:j.department,priority:j.priority,
 startDate:j.start_date,dueFrom:j.due_from,dueTo:j.due_to,totalQty:j.total_qty,
 status:j.state,workflowStatus:j.workflow_status,deliveryChannel:j.delivery_channel,
 deliveryContact:j.delivery_contact,deliveryLink:j.delivery_link,acceptedAt:j.accepted_at,
 acceptedBy:j.accepted_by,createdAt:j.created_at,itemsJson:JSON.stringify(j.job_items??[])
});

export const camelFile=(f:Record<string,unknown>)=>({id:f.id,jobId:f.job_id,fileName:f.file_name,sizeBytes:f.file_size,createdAt:f.created_at});
