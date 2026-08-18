import { supabaseAdmin } from "./supabase";

function cookie(req:Request,name:string){return req.headers.get("cookie")?.split(";").map(x=>x.trim()).find(x=>x.startsWith(name+"="))?.slice(name.length+1)}

export async function currentUser(req:Request){
 const token=cookie(req,"grp_graphic_session");if(!token)return null;
 const db=supabaseAdmin();const {data:{user}}=await db.auth.getUser(token);if(!user)return null;
 const {data:p}=await db.from("profiles").select("id,full_name,role,active,can_accept_jobs").eq("id",user.id).maybeSingle();
 if(!p?.active)return null;
 return {id:p.id,displayName:p.full_name,username:user.email??"",role:p.role,active:p.active,canAcceptJobs:p.can_accept_jobs};
}
export async function requireUser(req:Request,role?:"admin"){const u=await currentUser(req);if(!u||role&&u.role!==role)return null;return u}
export const sessionCookie=(token:string,expiresIn:number)=>`grp_graphic_session=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${expiresIn}`;
export const clearCookie="grp_graphic_session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0";
