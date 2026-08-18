# วิธีนำเว็บไซต์ GRP Sticker Request ไปใช้งานจริง

## 1. ตั้งค่า Supabase

1. เปิด Supabase Dashboard และสร้าง Project
2. เปิด SQL Editor
3. เปิดไฟล์ `supabase/migrations/20260818162842_grp_sticker_schema.sql`
4. คัดลอก SQL ทั้งหมดไปวาง แล้วกด Run เพียงครั้งเดียว
5. ไปที่ Project Settings > API Keys และเก็บค่าต่อไปนี้ไว้
   - Project URL
   - Publishable key
   - Secret key

ห้ามนำ Secret key ไปใส่ในหน้าเว็บหรือเผยแพร่ใน GitHub

## 2. นำขึ้น Netlify

1. อัปโหลดโฟลเดอร์นี้ไปยัง Repository หรือใช้ Netlify CLI
2. Build command: `npm run build`
3. Node version: `22`
4. เพิ่ม Environment variables ใน Netlify:
   - `SUPABASE_URL`
   - `SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SECRET_KEY`
5. กด Deploy

## 3. สร้างแอดมินครั้งแรก

1. เปิดลิงก์เว็บไซต์ `/graphic`
2. ระบบจะแสดงหน้าตั้งค่าแอดมินครั้งแรก
3. กรอกชื่อ อีเมล และรหัสผ่านอย่างน้อย 8 ตัว
4. หลังเข้าสู่ระบบ แอดมินสามารถเพิ่มผู้ใช้กราฟิกและกำหนดสิทธิ์รับงานได้

## ฟังก์ชันที่รวมอยู่

- แบบฟอร์มขอออกแบบและผลิตสื่อ
- เลขเอกสาร GRP อัตโนมัติ
- SLA และคำนวณวันส่งงาน
- กล่องรับงานกราฟิกและแจ้งงานค้างสีแดง
- แอดมิน ผู้ใช้ และสิทธิ์รับงาน
- สถานะงานสำหรับผู้ขอตรวจสอบ
- ภาพตัวอย่างสูงสุด 5 ภาพ
- ไฟล์ส่งงานและลิงก์ส่งงาน
- แชร์เลขงานและลิงก์ติดตามผ่าน LINE
