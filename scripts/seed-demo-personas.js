require("dotenv").config({ path: ".env.local" });

const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

const BUILDINGS = {
  champa: "2b750769-ef9a-4a94-be8b-3264a7891316",
  champee: "85eb8450-1687-4b45-96ba-c3421ba0b695",
  chuanchom: "0055fd38-e0ae-4895-8e47-ee7f5375bf44",
  pudson: "d061be76-e268-4073-ad69-bdb8a71cbb84",
};

const ROOMS = {
  pudson104: "00d0f582-b6b6-4bf2-9ef1-66607aa0c6ea",
  champee505: "03cda20d-cb73-4bfd-8dc9-5f7b62fd1a01",
  chuanchom104: "00c145da-fe34-4ab8-baaa-16a053cc4030",
};

const BEDS = {
  pudson104A: "93093789-8050-4e96-94b9-c1b1dd903e30",
  champee505A: "3e286806-f395-487f-8df8-0dcf02c6ad29",
  chuanchom104A: "b91d8ae9-1e6e-4422-95bb-a09f3cd35b25",
};

const SCORE_CATEGORIES = {
  activities: "99de1dc3-f174-476f-888f-8209df65d3fa",
  communityService: "fd44a086-369b-4188-94ac-4e6f4ef99d00",
  meetings: "557bef3b-be81-4d07-b451-b449d7209248",
  rules: "738fe96e-fdb1-4400-87d5-8a05829f85b7",
};

const accounts = [
  {
    key: "student1",
    email: "student1@c-madong.app",
    password: "devstudent123",
    profile: {
      role: "student",
      student_id: "6730201456",
      full_name_th: "กัญญาณัฐ ศรีวัฒน์",
      full_name_en: "Kanyanat Sriwat",
      display_name: "กัญญาณัฐ",
      faculty: "คณะนิเทศศาสตร์",
      phone: "081-234-5601",
      building_id: BUILDINGS.pudson,
      room_id: ROOMS.pudson104,
      bed_id: BEDS.pudson104A,
      move_in_date: "2025-06-09",
      language: "th",
      onboarding_completed: true,
      status: "active",
      avatar_url: null,
    },
  },
  {
    key: "student2",
    email: "student2@c-madong.app",
    password: "devstudent456",
    profile: {
      role: "student",
      student_id: "6631102784",
      full_name_th: "ภัทรพล อินทร์แก้ว",
      full_name_en: "Phattharaphon Inkaew",
      display_name: "ภัทรพล",
      faculty: "คณะวิศวกรรมศาสตร์",
      phone: "089-442-7812",
      building_id: BUILDINGS.champee,
      room_id: ROOMS.champee505,
      bed_id: BEDS.champee505A,
      move_in_date: "2024-08-05",
      language: "th",
      onboarding_completed: true,
      status: "active",
      avatar_url: null,
    },
  },
  {
    key: "student3",
    email: "student3@c-madong.app",
    password: "devstudent789",
    profile: {
      role: "student",
      student_id: "6834503917",
      full_name_th: "ลลิตา บุญส่ง",
      full_name_en: "Lalita Boonsong",
      display_name: "ลลิตา",
      faculty: "คณะอักษรศาสตร์ (หลักสูตรนานาชาติ)",
      phone: "086-915-3472",
      building_id: BUILDINGS.chuanchom,
      room_id: ROOMS.chuanchom104,
      bed_id: BEDS.chuanchom104A,
      move_in_date: "2026-01-12",
      language: "en",
      onboarding_completed: true,
      status: "active",
      avatar_url: null,
    },
  },
  {
    key: "adminsup",
    email: "adminsup@c-madong.app",
    password: "superadmin123",
    profile: {
      role: "admin",
      full_name_th: "ดร.ปาริชาติ สุวรรณกิจ",
      full_name_en: "Dr. Parichat Suwannakit",
      display_name: "ผอ.ปาริชาติ",
      faculty: null,
      phone: "02-218-7000",
      language: "th",
      onboarding_completed: true,
      status: "active",
      avatar_url: null,
    },
    appRoles: ["super_admin"],
  },
  {
    key: "admin1",
    email: "admin1@c-madong.app",
    password: "dev1admin123",
    profile: {
      role: "admin",
      full_name_th: "ชุติมา วรรณกิจ",
      full_name_en: "Chutima Wannakit",
      display_name: "ชุติมา",
      faculty: null,
      phone: "02-218-7011",
      language: "th",
      onboarding_completed: true,
      status: "active",
      avatar_url: null,
    },
    appRoles: ["admin_staff", "finance"],
  },
  {
    key: "admin2",
    email: "admin2@c-madong.app",
    password: "dev2admin456",
    profile: {
      role: "admin",
      full_name_th: "กิตติศักดิ์ รุ่งเรือง",
      full_name_en: "Kittisak Rungrueang",
      display_name: "กิตติศักดิ์",
      faculty: null,
      phone: "02-218-7018",
      language: "th",
      onboarding_completed: true,
      status: "active",
      avatar_url: null,
    },
    appRoles: ["admin_staff", "parcel"],
  },
];

const demoEvents = [
  {
    id: "31a5392a-4dbd-4536-9732-c17933f64c01",
    title: "ปฐมนิเทศระเบียบหอพัก ภาคปลาย 2569",
    title_th: "ปฐมนิเทศระเบียบหอพัก ภาคปลาย 2569",
    title_en: "Dormitory Orientation Semester 2/2026",
    description: "ประชุมชี้แจงกฎระเบียบและการใช้พื้นที่ส่วนกลาง",
    description_th: "ประชุมชี้แจงกฎระเบียบและการใช้พื้นที่ส่วนกลาง",
    description_en: "Resident orientation covering dorm rules and shared-space etiquette.",
    location: "ห้องประชุมชั้น 1 อาคารชวนชม",
    location_th: "ห้องประชุมชั้น 1 อาคารชวนชม",
    location_en: "Chuanchom Hall, 1st Floor",
    event_date: "2026-02-03",
    event_time: "18:00:00",
    start_datetime: "2026-02-03T11:00:00.000Z",
    end_datetime: "2026-02-03T13:00:00.000Z",
    event_status: "completed",
    event_type: "meeting",
    impact_level: "medium",
    is_mandatory: true,
    score_points: 4,
    penalty_points: 3,
    score_category_id: SCORE_CATEGORIES.meetings,
    academic_year: 2026,
    semester: 2,
    max_capacity: 180,
    building_id: BUILDINGS.chuanchom,
  },
  {
    id: "f4627650-7bcc-4828-ba15-9ae1f94e1ee7",
    title: "Big Cleaning Day หอพักนิสิต",
    title_th: "Big Cleaning Day หอพักนิสิต",
    title_en: "Dorm Big Cleaning Day",
    description: "กิจกรรมทำความสะอาดพื้นที่ส่วนกลางและลานกิจกรรม",
    description_th: "กิจกรรมทำความสะอาดพื้นที่ส่วนกลางและลานกิจกรรม",
    description_en: "Volunteer clean-up activity for shared dorm facilities.",
    location: "ลานกิจกรรมหอพักนิสิต",
    location_th: "ลานกิจกรรมหอพักนิสิต",
    location_en: "Dorm Activity Courtyard",
    event_date: "2026-03-14",
    event_time: "09:00:00",
    start_datetime: "2026-03-14T02:00:00.000Z",
    end_datetime: "2026-03-14T05:00:00.000Z",
    event_status: "completed",
    event_type: "community_service",
    impact_level: "high",
    is_mandatory: false,
    score_points: 6,
    penalty_points: 0,
    score_category_id: SCORE_CATEGORIES.communityService,
    academic_year: 2026,
    semester: 2,
    max_capacity: 120,
    building_id: BUILDINGS.pudson,
  },
  {
    id: "54917be5-cd72-4682-bef6-8345f69d171a",
    title: "ซ้อมอพยพหนีไฟหอพักนิสิต",
    title_th: "ซ้อมอพยพหนีไฟหอพักนิสิต",
    title_en: "Dorm Fire Drill",
    description: "ฝึกซ้อมอพยพฉุกเฉินและตรวจความพร้อมอุปกรณ์ความปลอดภัย",
    description_th: "ฝึกซ้อมอพยพฉุกเฉินและตรวจความพร้อมอุปกรณ์ความปลอดภัย",
    description_en: "Mandatory evacuation drill and safety readiness check.",
    location: "หน้าอาคารพักอาศัยรวม",
    location_th: "หน้าอาคารพักอาศัยรวม",
    location_en: "Central Residential Plaza",
    event_date: "2026-03-28",
    event_time: "19:00:00",
    start_datetime: "2026-03-28T12:00:00.000Z",
    end_datetime: "2026-03-28T13:00:00.000Z",
    event_status: "completed",
    event_type: "safety_drill",
    impact_level: "high",
    is_mandatory: true,
    score_points: 3,
    penalty_points: 5,
    score_category_id: SCORE_CATEGORIES.rules,
    academic_year: 2026,
    semester: 2,
    max_capacity: 250,
    building_id: BUILDINGS.chuanchom,
  },
  {
    id: "7448c522-caf7-4681-bfe6-68f75b08efdc",
    title: "ประชุมเตรียมขออยู่หอต่อ ภาคเรียนที่ 1/2570",
    title_th: "ประชุมเตรียมขออยู่หอต่อ ภาคเรียนที่ 1/2570",
    title_en: "Reapplication Briefing for Semester 1/2027",
    description: "ประชุมชี้แจงเอกสารและกำหนดการสำหรับการขออยู่หอต่อ",
    description_th: "ประชุมชี้แจงเอกสารและกำหนดการสำหรับการขออยู่หอต่อ",
    description_en: "Briefing session for dorm reapplication requirements and timeline.",
    location: "ห้องประชุมสำนักงานหอพัก",
    location_th: "ห้องประชุมสำนักงานหอพัก",
    location_en: "Dorm Office Meeting Room",
    event_date: "2026-05-06",
    event_time: "17:30:00",
    start_datetime: "2026-05-06T10:30:00.000Z",
    end_datetime: "2026-05-06T12:00:00.000Z",
    event_status: "published",
    event_type: "meeting",
    impact_level: "medium",
    is_mandatory: true,
    score_points: 3,
    penalty_points: 2,
    score_category_id: SCORE_CATEGORIES.meetings,
    academic_year: 2026,
    semester: 2,
    max_capacity: 180,
    building_id: BUILDINGS.chuanchom,
  },
];

function buildMaintenanceRows(users) {
  return [
    {
      id: "4884121a-1ef6-4840-87f2-f51034b65469",
      requester_id: users.student1.id,
      category: "internet",
      title: "Wi-Fi หอพักหลุดบ่อยช่วงกลางคืน",
      description: "สัญญาณอินเทอร์เน็ตห้อง 104 อาคารพุดซ้อนหลุดทุกคืนช่วงประมาณ 21:00-23:00 ทำให้ประชุมออนไลน์และส่งงานลำบาก",
      status: "in_progress",
      appointment_date: "2026-05-02",
      appointment_time: "19:00",
      ai_category: "internet",
      ai_priority: "medium",
      admin_notes: "ติดต่อช่างไอทีแล้ว นัดตรวจ access point ชั้น 1",
      accepted_at: "2026-04-28T08:30:00.000Z",
      created_at: "2026-04-27T13:15:00.000Z",
      updated_at: "2026-04-29T04:10:00.000Z",
    },
    {
      id: "7e4d9f49-5ff1-4e29-b452-49a2e10257cd",
      requester_id: users.student2.id,
      category: "door_lock",
      title: "ลูกบิดประตูห้องหลวม",
      description: "ลูกบิดประตูห้อง 505 อาคารจำปีหมุนฟรีเป็นบางครั้งและต้องใช้แรงดันเพิ่มในการล็อก",
      status: "completed",
      appointment_date: "2026-04-20",
      appointment_time: "16:30",
      ai_category: "door_lock",
      ai_priority: "low",
      admin_notes: "เปลี่ยนชุดลูกบิดและทดสอบเรียบร้อย",
      accepted_at: "2026-04-18T03:00:00.000Z",
      resolved_at: "2026-04-20T10:05:00.000Z",
      created_at: "2026-04-17T15:10:00.000Z",
      updated_at: "2026-04-20T10:05:00.000Z",
    },
    {
      id: "afb76f28-772d-4f35-b1ec-5e929ad5bf4f",
      requester_id: users.student3.id,
      category: "plumbing",
      title: "น้ำซึมใต้ซิงก์ล้างหน้า",
      description: "ใต้อ่างล้างหน้าห้อง 104 อาคารชวนชมมีน้ำซึมหลังใช้งานตอนเช้า คาดว่าข้อต่อเริ่มคลาย",
      status: "under_review",
      appointment_date: null,
      appointment_time: null,
      ai_category: "plumbing",
      ai_priority: "medium",
      admin_notes: "รอตรวจหน้างานโดยทีมบริการ",
      created_at: "2026-04-29T02:20:00.000Z",
      updated_at: "2026-04-29T02:20:00.000Z",
    },
  ];
}

function buildParcelRows(users) {
  return [
    {
      id: "9d574746-c086-4bf7-ab01-36ba34f55e81",
      student_id: users.student1.id,
      tracking_number: "THPDS24043001",
      courier: "Thailand Post",
      parcel_type: "box",
      description: "เอกสารฝึกงานและพัสดุส่วนตัวจากบ้าน",
      status: "notified",
      pickup_location: "สำนักงานการทะเบียนหอพักนิสิตจุฬา ตึกพุดซ้อน",
      pickup_code: "PS1048",
      registered_by: users.admin2.id,
      notified_at: "2026-04-29T05:45:00.000Z",
      created_at: "2026-04-28T10:30:00.000Z",
      updated_at: "2026-04-29T05:45:00.000Z",
    },
    {
      id: "c85d11ee-b1ab-4cad-840f-a79255f77843",
      student_id: users.student2.id,
      tracking_number: "JNTBKK24042588",
      courier: "J&T Express",
      parcel_type: "bag",
      description: "อุปกรณ์อิเล็กทรอนิกส์และสายชาร์จ",
      status: "picked_up",
      pickup_location: "สำนักงานการทะเบียนหอพักนิสิตจุฬา ตึกจำปี",
      pickup_code: "CP5052",
      registered_by: users.admin2.id,
      notified_at: "2026-04-25T03:00:00.000Z",
      picked_up_at: "2026-04-26T09:10:00.000Z",
      created_at: "2026-04-24T11:20:00.000Z",
      updated_at: "2026-04-26T09:10:00.000Z",
    },
    {
      id: "c18f4d4c-7c0a-434d-9778-3d74ddcb79fd",
      student_id: users.student3.id,
      tracking_number: "KEXCM24042915",
      courier: "Kerry Express",
      parcel_type: "envelope",
      description: "จดหมายตอบรับโครงการแลกเปลี่ยนและเอกสารรับรอง",
      status: "pending",
      pickup_location: "สำนักงานการทะเบียนหอพักนิสิตจุฬา ตึกชวนชม",
      pickup_code: "CC1043",
      registered_by: users.admin2.id,
      created_at: "2026-04-29T06:40:00.000Z",
      updated_at: "2026-04-29T06:40:00.000Z",
    },
  ];
}

function buildBills(users, students) {
  const rows = [
    {
      id: "1c2d9826-09f2-49d5-aae7-62da685471f8",
      student_id: users.student1.id,
      building_id: students.student1.building_id,
      room_id: students.student1.room_id,
      bed_id: students.student1.bed_id,
      billing_month: 4,
      billing_year: 2026,
      billing_round: 1,
      total_amount: 0,
      due_date: "2026-04-18",
      status: "overdue",
      admin_notes: "นักศึกษารับทราบแล้ว รอชำระภายในสัปดาห์นี้",
      created_by: users.admin1.id,
      created_at: "2026-04-01T02:00:00.000Z",
      updated_at: "2026-04-22T08:00:00.000Z",
    },
    {
      id: "0cc5ea72-d65b-48ce-8080-f5561a4c876d",
      student_id: users.student2.id,
      building_id: students.student2.building_id,
      room_id: students.student2.room_id,
      bed_id: students.student2.bed_id,
      billing_month: 4,
      billing_year: 2026,
      billing_round: 1,
      total_amount: 0,
      due_date: "2026-04-18",
      status: "paid",
      admin_notes: "ชำระครบผ่านเคาน์เตอร์หอพัก",
      paid_at: "2026-04-14T03:20:00.000Z",
      paid_by: users.admin1.id,
      created_by: users.admin1.id,
      created_at: "2026-04-01T02:00:00.000Z",
      updated_at: "2026-04-14T03:20:00.000Z",
    },
    {
      id: "7707ec17-adb1-451a-9d83-caf05df5f8af",
      student_id: users.student3.id,
      building_id: students.student3.building_id,
      room_id: students.student3.room_id,
      bed_id: students.student3.bed_id,
      billing_month: 5,
      billing_year: 2026,
      billing_round: 1,
      total_amount: 0,
      due_date: "2026-05-10",
      status: "pending",
      admin_notes: "รอบบิลล่าสุดสำหรับนักศึกษาที่เพิ่งย้ายเข้า",
      created_by: users.admin1.id,
      created_at: "2026-04-28T01:30:00.000Z",
      updated_at: "2026-04-28T01:30:00.000Z",
    },
  ];

  const items = [
    {
      id: "d316c6d3-7132-41af-bbd6-3ad70391d8a9",
      bill_id: rows[0].id,
      label: "ค่าหอพัก เดือนเมษายน 2569",
      category: "room",
      amount: 3500,
      notes: "ห้องมาตรฐาน 3 เตียง",
    },
    {
      id: "8fcb2377-90d5-490f-a42f-424d46a6fd27",
      bill_id: rows[0].id,
      label: "ค่าไฟฟ้า",
      category: "electricity",
      amount: 640,
      notes: "หน่วยใช้งานจริง",
    },
    {
      id: "0a9948fd-689b-4c5d-ab54-a96979f6838b",
      bill_id: rows[0].id,
      label: "ค่าน้ำประปา",
      category: "water",
      amount: 140,
      notes: null,
    },
    {
      id: "f55ae3df-f3f0-4c30-beb1-52e036f538fc",
      bill_id: rows[1].id,
      label: "ค่าหอพัก เดือนเมษายน 2569",
      category: "room",
      amount: 3500,
      notes: "ห้องมาตรฐาน 3 เตียง",
    },
    {
      id: "73646126-3938-4279-a31e-dc6274b73f46",
      bill_id: rows[1].id,
      label: "ค่าไฟฟ้า",
      category: "electricity",
      amount: 510,
      notes: "ประหยัดพลังงานดี",
    },
    {
      id: "49fb0a39-82c4-4149-81f0-3f8ec73d082b",
      bill_id: rows[1].id,
      label: "ค่าน้ำประปา",
      category: "water",
      amount: 130,
      notes: null,
    },
    {
      id: "6e777e64-2e84-4b80-b48d-adbef8aa69ee",
      bill_id: rows[2].id,
      label: "ค่าหอพัก เดือนพฤษภาคม 2569",
      category: "room",
      amount: 3500,
      notes: "งวดแรกหลังย้ายเข้า",
    },
    {
      id: "291fb8bb-f7bd-41da-8e64-658835851289",
      bill_id: rows[2].id,
      label: "ค่าไฟฟ้าประมาณการ",
      category: "electricity",
      amount: 420,
      notes: "ใช้ตามประมาณการเดือนแรก",
    },
    {
      id: "7aa912b9-12ea-4a50-b77d-6bd2f6ccc0ec",
      bill_id: rows[2].id,
      label: "ค่าน้ำประปา",
      category: "water",
      amount: 120,
      notes: null,
    },
  ];

  return { rows, items };
}

function buildAttendanceRows(students) {
  return [
    {
      id: "a8f3b572-d344-4712-9c76-ba927fec70e9",
      event_id: demoEvents[0].id,
      student_id: students.student1.student_id,
      checked_in: true,
      checked_in_at: "2026-02-03T11:08:00.000Z",
      status: "attended",
      created_at: "2026-02-03T10:40:00.000Z",
    },
    {
      id: "8d56ab2d-c0ff-424d-869e-40d12d3613c5",
      event_id: demoEvents[1].id,
      student_id: students.student1.student_id,
      checked_in: true,
      checked_in_at: "2026-03-14T02:05:00.000Z",
      status: "attended",
      created_at: "2026-03-13T11:00:00.000Z",
    },
    {
      id: "7d0ee5a1-828f-4c35-b4df-fc4d313f098d",
      event_id: demoEvents[3].id,
      student_id: students.student1.student_id,
      checked_in: false,
      status: "registered",
      created_at: "2026-04-29T07:00:00.000Z",
    },
    {
      id: "03b47989-0993-47f4-95b4-d4c26ef5aaba",
      event_id: demoEvents[0].id,
      student_id: students.student2.student_id,
      checked_in: true,
      checked_in_at: "2026-02-03T10:58:00.000Z",
      status: "attended",
      created_at: "2026-02-02T09:30:00.000Z",
    },
    {
      id: "c88fda3d-86d3-427d-bb20-73e5c8b52516",
      event_id: demoEvents[1].id,
      student_id: students.student2.student_id,
      checked_in: true,
      checked_in_at: "2026-03-14T02:02:00.000Z",
      status: "attended",
      created_at: "2026-03-10T09:30:00.000Z",
    },
    {
      id: "19490da7-1238-449f-ae2a-a5997f772662",
      event_id: demoEvents[2].id,
      student_id: students.student2.student_id,
      checked_in: true,
      checked_in_at: "2026-03-28T12:01:00.000Z",
      status: "attended",
      created_at: "2026-03-20T11:30:00.000Z",
    },
    {
      id: "2bb3bb85-e54c-4270-92e8-f0436ec0d0bb",
      event_id: demoEvents[3].id,
      student_id: students.student2.student_id,
      checked_in: false,
      status: "registered",
      created_at: "2026-04-29T07:15:00.000Z",
    },
    {
      id: "4f661cce-4a17-4452-af14-bf0ff8bf48d3",
      event_id: demoEvents[0].id,
      student_id: students.student3.student_id,
      checked_in: true,
      checked_in_at: "2026-02-03T11:02:00.000Z",
      status: "attended",
      created_at: "2026-02-02T14:00:00.000Z",
    },
    {
      id: "885f3e90-cb55-4e64-8191-1fb8dd714f3c",
      event_id: demoEvents[2].id,
      student_id: students.student3.student_id,
      checked_in: false,
      status: "absent",
      created_at: "2026-03-26T07:20:00.000Z",
    },
    {
      id: "1ef03099-c1de-41e3-b234-1ec0fd5ca80b",
      event_id: demoEvents[3].id,
      student_id: students.student3.student_id,
      checked_in: false,
      status: "registered",
      created_at: "2026-04-29T07:30:00.000Z",
    },
  ];
}

function buildScoreRows(students) {
  return [
    {
      id: "bc6f553e-7d88-438a-98b9-6d68f1ab008f",
      student_id: students.student1.student_id,
      category_id: SCORE_CATEGORIES.meetings,
      points: 4,
      reason: "เข้าร่วมปฐมนิเทศระเบียบหอพัก ภาคปลาย 2569",
      event_id: demoEvents[0].id,
      source: "manual_admin",
      description_th: "เข้าร่วมปฐมนิเทศระเบียบหอพัก ภาคปลาย 2569",
      description_en: "Attended dormitory orientation.",
      academic_year: 2026,
      semester: 2,
      created_at: "2026-02-03T13:30:00.000Z",
    },
    {
      id: "10ebd852-8b9f-4328-867e-b3c22c572027",
      student_id: students.student1.student_id,
      category_id: SCORE_CATEGORIES.communityService,
      points: 6,
      reason: "อาสาช่วยกิจกรรม Big Cleaning Day",
      event_id: demoEvents[1].id,
      source: "manual_admin",
      description_th: "อาสาช่วยกิจกรรม Big Cleaning Day",
      description_en: "Joined the volunteer clean-up activity.",
      academic_year: 2026,
      semester: 2,
      created_at: "2026-03-14T06:00:00.000Z",
    },
    {
      id: "7ef7f1f5-b8e6-4466-b9ce-2d3b8a2a57c0",
      student_id: students.student1.student_id,
      category_id: SCORE_CATEGORIES.activities,
      points: 2,
      reason: "ช่วยงานต้อนรับนิสิตใหม่ภายในอาคาร",
      event_id: null,
      source: "manual_admin",
      description_th: "ช่วยงานต้อนรับนิสิตใหม่ภายในอาคาร",
      description_en: "Helped with dorm resident support duties.",
      academic_year: 2026,
      semester: 2,
      created_at: "2026-04-02T03:30:00.000Z",
    },
    {
      id: "e9c6725a-3230-4991-8f2c-f25994b5218c",
      student_id: students.student2.student_id,
      category_id: SCORE_CATEGORIES.meetings,
      points: 4,
      reason: "เข้าร่วมประชุมชี้แจงครบถ้วน",
      event_id: demoEvents[0].id,
      source: "manual_admin",
      description_th: "เข้าร่วมประชุมชี้แจงครบถ้วน",
      description_en: "Attended the orientation meeting on time.",
      academic_year: 2026,
      semester: 2,
      created_at: "2026-02-03T13:10:00.000Z",
    },
    {
      id: "b101db7f-a41a-4450-b37e-89f1d27395fb",
      student_id: students.student2.student_id,
      category_id: SCORE_CATEGORIES.communityService,
      points: 6,
      reason: "ร่วมกิจกรรม Big Cleaning Day ตลอดช่วงเวลา",
      event_id: demoEvents[1].id,
      source: "manual_admin",
      description_th: "ร่วมกิจกรรม Big Cleaning Day ตลอดช่วงเวลา",
      description_en: "Participated in the full volunteer activity.",
      academic_year: 2026,
      semester: 2,
      created_at: "2026-03-14T06:05:00.000Z",
    },
    {
      id: "6977db10-f258-4fab-8c9d-d441ef315eab",
      student_id: students.student2.student_id,
      category_id: SCORE_CATEGORIES.rules,
      points: 3,
      reason: "เข้าร่วมซ้อมอพยพหนีไฟครบตามข้อกำหนด",
      event_id: demoEvents[2].id,
      source: "manual_admin",
      description_th: "เข้าร่วมซ้อมอพยพหนีไฟครบตามข้อกำหนด",
      description_en: "Completed the mandatory fire drill.",
      academic_year: 2026,
      semester: 2,
      created_at: "2026-03-28T13:15:00.000Z",
    },
    {
      id: "0c6a9d08-7a93-4dfe-aef1-b2a2c58ecee5",
      student_id: students.student2.student_id,
      category_id: SCORE_CATEGORIES.activities,
      points: 5,
      reason: "เป็นพี่เลี้ยงกิจกรรมรับน้องหอพัก",
      event_id: null,
      source: "manual_admin",
      description_th: "เป็นพี่เลี้ยงกิจกรรมรับน้องหอพัก",
      description_en: "Served as a resident mentor for dorm activities.",
      academic_year: 2026,
      semester: 2,
      created_at: "2026-04-04T04:00:00.000Z",
    },
    {
      id: "14c4a1ad-7f59-4d98-8954-894540d541cb",
      student_id: students.student3.student_id,
      category_id: SCORE_CATEGORIES.meetings,
      points: 4,
      reason: "เข้าร่วมปฐมนิเทศหอพัก",
      event_id: demoEvents[0].id,
      source: "manual_admin",
      description_th: "เข้าร่วมปฐมนิเทศหอพัก",
      description_en: "Attended the dorm orientation.",
      academic_year: 2026,
      semester: 2,
      created_at: "2026-02-03T13:40:00.000Z",
    },
    {
      id: "b4dccd9a-7ab4-4e95-9a40-ec4e352b7654",
      student_id: students.student3.student_id,
      category_id: SCORE_CATEGORIES.rules,
      points: -5,
      reason: "ขาดซ้อมอพยพหนีไฟที่เป็นกิจกรรมบังคับ",
      event_id: demoEvents[2].id,
      source: "manual_admin",
      description_th: "ขาดซ้อมอพยพหนีไฟที่เป็นกิจกรรมบังคับ",
      description_en: "Missed the mandatory fire drill.",
      academic_year: 2026,
      semester: 2,
      created_at: "2026-03-28T13:20:00.000Z",
    },
    {
      id: "ae98f512-a7f1-4cea-84e9-3f4c3247fd05",
      student_id: students.student3.student_id,
      category_id: SCORE_CATEGORIES.activities,
      points: 2,
      reason: "ช่วยงานประชาสัมพันธ์กิจกรรมชั้นหอพัก",
      event_id: null,
      source: "manual_admin",
      description_th: "ช่วยงานประชาสัมพันธ์กิจกรรมชั้นหอพัก",
      description_en: "Helped with resident activity communications.",
      academic_year: 2026,
      semester: 2,
      created_at: "2026-04-10T06:30:00.000Z",
    },
  ];
}

async function ensureUserRole(userId, role) {
  const { data: existingRole, error: selectError } = await supabase
    .from("user_roles")
    .select("id, is_active")
    .eq("user_id", userId)
    .eq("role", role)
    .is("building_scope", null)
    .maybeSingle();

  if (selectError) throw selectError;

  if (!existingRole) {
    const { error } = await supabase.from("user_roles").insert({
      user_id: userId,
      role,
      is_active: true,
      metadata: { source: "scripts/seed-demo-personas.js" },
    });
    if (error) throw error;
    return;
  }

  if (!existingRole.is_active) {
    const { error } = await supabase
      .from("user_roles")
      .update({ is_active: true })
      .eq("id", existingRole.id);
    if (error) throw error;
  }
}

async function ensureAuthAndProfile(account) {
  const { data: existingProfile, error: profileLookupError } = await supabase
    .from("profiles")
    .select("id, bed_id")
    .eq("email", account.email)
    .maybeSingle();

  if (profileLookupError) throw profileLookupError;

  let userId = existingProfile?.id ?? null;

  if (!userId) {
    const { data: createdUser, error: createUserError } =
      await supabase.auth.admin.createUser({
        email: account.email,
        password: account.password,
        email_confirm: true,
        user_metadata: {
          full_name_th: account.profile.full_name_th,
          full_name_en: account.profile.full_name_en,
          display_name: account.profile.display_name,
          source: "scripts/seed-demo-personas.js",
        },
      });

    if (createUserError) throw createUserError;
    userId = createdUser.user?.id ?? null;
  }

  if (!userId) {
    throw new Error(`No auth user ID available for ${account.email}`);
  }

  const { error: authUpdateError } = await supabase.auth.admin.updateUserById(userId, {
    email: account.email,
    password: account.password,
    user_metadata: {
      full_name_th: account.profile.full_name_th,
      full_name_en: account.profile.full_name_en,
      display_name: account.profile.display_name,
      demo_persona: true,
      source: "scripts/seed-demo-personas.js",
    },
  });
  if (authUpdateError) throw authUpdateError;

  const { error: profileUpsertError } = await supabase.from("profiles").upsert({
    id: userId,
    email: account.email,
    ...account.profile,
  });
  if (profileUpsertError) throw profileUpsertError;

  for (const role of account.appRoles ?? []) {
    await ensureUserRole(userId, role);
  }

  return { id: userId, previousBedId: existingProfile?.bed_id ?? null };
}

async function syncBedOccupancy(previousBedIds, nextBedIds) {
  const releaseIds = previousBedIds.filter((id) => id && !nextBedIds.includes(id));
  if (releaseIds.length > 0) {
    const { error } = await supabase
      .from("beds")
      .update({ is_occupied: false })
      .in("id", releaseIds);
    if (error) throw error;
  }

  if (nextBedIds.length > 0) {
    const { error } = await supabase
      .from("beds")
      .update({ is_occupied: true })
      .in("id", nextBedIds);
    if (error) throw error;
  }
}

async function upsertRows(table, rows) {
  if (rows.length === 0) return;
  const { error } = await supabase.from(table).upsert(rows);
  if (error) throw error;
}

async function main() {
  const userMap = {};
  const previousStudentBedIds = [];

  for (const account of accounts) {
    const result = await ensureAuthAndProfile(account);
    userMap[account.key] = { id: result.id };

    if (result.previousBedId) {
      previousStudentBedIds.push(result.previousBedId);
    }
  }

  const studentProfiles = Object.fromEntries(
    accounts
      .filter((account) => account.key.startsWith("student"))
      .map((account) => [account.key, account.profile])
  );

  await syncBedOccupancy(
    previousStudentBedIds,
    Object.values(studentProfiles).map((profile) => profile.bed_id)
  );

  await upsertRows(
    "dorm_events",
    demoEvents.map((event) => ({
      ...event,
      created_by: userMap.adminsup.id,
      updated_at: new Date().toISOString(),
    }))
  );

  await upsertRows("maintenance_requests", buildMaintenanceRows(userMap));
  await upsertRows("parcels", buildParcelRows(userMap));

  const billPayload = buildBills(userMap, studentProfiles);
  await upsertRows("bills", billPayload.rows);
  await upsertRows("bill_items", billPayload.items);

  await upsertRows("event_attendance", buildAttendanceRows(studentProfiles));
  await upsertRows("score_entries", buildScoreRows(studentProfiles));

  const { error: refreshError } = await supabase.rpc("refresh_score_summary");
  if (refreshError) throw refreshError;

  console.log(
    JSON.stringify(
      {
        users: Object.fromEntries(
          Object.entries(userMap).map(([key, value]) => [key, value.id])
        ),
        seeded: {
          profiles: accounts.length,
          dorm_events: demoEvents.length,
          maintenance_requests: 3,
          parcels: 3,
          bills: billPayload.rows.length,
          bill_items: billPayload.items.length,
          event_attendance: 10,
          score_entries: 10,
        },
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
