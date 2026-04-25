"use client";

import { useEffect } from "react";
import type { MaterialItem } from "@/lib/supabase/types";

const CATEGORY_LABELS: Record<string, string> = {
  plumbing: "ประปา",
  electrical: "ไฟฟ้า",
  aircon: "เครื่องปรับอากาศ",
  air_conditioning: "เครื่องปรับอากาศ",
  furniture: "เฟอร์นิเจอร์",
  pest: "สัตว์/แมลง",
  internet: "อินเทอร์เน็ต",
  door_lock: "ประตู/กุญแจ",
  cleaning: "ความสะอาด",
  other: "อื่นๆ",
};

function toBuddhistYear(iso: string): string {
  const d = new Date(iso);
  const day = d.getDate();
  const month = d.toLocaleDateString("th-TH", { month: "long" });
  const year = d.getFullYear() + 543;
  return `${day} ${month} ${year}`;
}

interface RequisitionDocumentProps {
  ticketCode: string;
  title: string;
  category: string;
  createdAt: string;
  appointmentDate?: string;
  appointmentTime?: string;
  requesterName: string;
  buildingName?: string;
  roomNumber?: string;
  technicianName?: string;
  materials: MaterialItem[];
}

export function RequisitionDocument({
  ticketCode,
  title,
  category,
  createdAt,
  appointmentDate,
  appointmentTime,
  requesterName,
  buildingName,
  roomNumber,
  technicianName,
  materials,
}: RequisitionDocumentProps) {
  // Auto-focus for keyboard print shortcut
  useEffect(() => {
    document.title = `ใบเบิกวัสดุ #${ticketCode}`;
  }, [ticketCode]);

  const location = [buildingName, roomNumber ? `ห้อง ${roomNumber}` : null]
    .filter(Boolean)
    .join(" ");

  const dateStr = toBuddhistYear(createdAt);
  const apptStr = appointmentDate
    ? `${appointmentDate}${appointmentTime ? ` เวลา ${appointmentTime}` : ""}`
    : "-";

  const categoryLabel = CATEGORY_LABELS[category] ?? category;

  // Fill empty rows to minimum 8 in table
  const MIN_ROWS = 8;
  const emptyRowCount = Math.max(0, MIN_ROWS - materials.length);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap');
        :root {
          --cu-pink: #DD598B;
          --cu-pink-light: #F9E1E9;
          --cu-pink-dark: #B8447A;
          --cu-cream: #FFF9F0;
          --border: #E5E0D8;
          --text-muted: #6B6B6A;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: 'Sarabun', serif;
          font-size: 11pt;
          background: #f0f0f0;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 24px 16px;
          gap: 16px;
        }
        .toolbar {
          width: 210mm;
          display: flex;
          align-items: center;
          gap: 10px;
          background: white;
          padding: 12px 20px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .toolbar h2 { flex: 1; font-size: 13pt; font-weight: 600; color: var(--cu-pink-dark); }
        .btn {
          padding: 7px 18px; border-radius: 6px; border: none;
          cursor: pointer; font-family: 'Sarabun', serif;
          font-size: 10pt; font-weight: 600;
        }
        .btn-print { background: var(--cu-pink); color: white; }
        .btn-print:hover { background: var(--cu-pink-dark); }
        .btn-back { background: var(--cu-pink-light); color: var(--cu-pink-dark); border: 1px solid var(--cu-pink); }
        .page {
          position: relative;
          width: 210mm;
          min-height: 297mm;
          background: white;
          padding: 16mm;
          box-shadow: 0 4px 20px rgba(0,0,0,0.12);
          overflow: hidden;
        }
        .watermark {
          position: absolute;
          bottom: 20mm; right: 14mm;
          opacity: 0.04; width: 72mm;
          pointer-events: none; z-index: 0;
        }
        .content { position: relative; z-index: 1; }
        .header {
          display: flex; align-items: center; gap: 12px;
          padding-bottom: 12px;
          border-bottom: 3px solid var(--cu-pink);
          margin-bottom: 14px;
        }
        .logo {
          width: 52px; height: 52px; border-radius: 50%;
          background: var(--cu-pink-light); border: 2px solid var(--cu-pink);
          display: flex; align-items: center; justify-content: center;
          font-size: 22px; flex-shrink: 0;
        }
        .header-title { font-size: 15pt; font-weight: 700; color: var(--cu-pink-dark); line-height: 1.2; }
        .header-sub { font-size: 9.5pt; color: var(--text-muted); margin-top: 2px; }
        .doc-badge { text-align: right; font-size: 9pt; color: var(--text-muted); line-height: 1.7; }
        .doc-number { font-size: 13pt; font-weight: 700; color: var(--cu-pink); letter-spacing: 0.5px; }
        .section-label {
          font-size: 9pt; font-weight: 600; text-transform: uppercase;
          letter-spacing: 0.8px; color: var(--cu-pink);
          background: var(--cu-pink-light); padding: 4px 10px;
          margin: 12px 0 8px; border-left: 3px solid var(--cu-pink);
          display: flex; align-items: center; gap: 6px;
        }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 20px; }
        .info-row { display: flex; gap: 6px; align-items: baseline; font-size: 10.5pt; }
        .info-label { color: var(--text-muted); white-space: nowrap; font-size: 9.5pt; min-width: 90px; }
        .info-value { font-weight: 500; border-bottom: 1px dashed var(--border); flex: 1; min-height: 18px; padding-bottom: 1px; }
        .info-value.highlight { color: var(--cu-pink-dark); font-weight: 700; font-size: 11.5pt; border-bottom: 1px solid var(--cu-pink); }
        .category-badge {
          display: inline-block; padding: 2px 10px; border-radius: 999px;
          font-size: 9pt; font-weight: 600;
          background: var(--cu-pink-light); color: var(--cu-pink-dark);
          border: 1px solid var(--cu-pink);
        }
        table { width: 100%; border-collapse: collapse; margin-top: 4px; font-size: 10.5pt; }
        th {
          background: var(--cu-pink); color: white;
          padding: 6px 10px; text-align: left;
          font-weight: 600; font-size: 9.5pt;
        }
        th:nth-child(1) { width: 32px; text-align: center; }
        th:nth-child(3) { width: 60px; text-align: center; }
        th:nth-child(4) { width: 50px; text-align: center; }
        th:nth-child(5) { width: 80px; }
        td { padding: 7px 10px; border-bottom: 1px solid var(--border); vertical-align: middle; }
        td:nth-child(1) { text-align: center; color: var(--text-muted); font-size: 9pt; }
        td:nth-child(3) { text-align: center; font-weight: 600; }
        td:nth-child(4) { text-align: center; }
        tr:nth-child(even) td { background: var(--cu-cream); }
        tr.data-row:last-child td, tr.empty-row:last-child td { border-bottom: 2px solid var(--cu-pink); }
        tr.empty-row td { height: 26px; }
        tr.empty-row:nth-child(even) td { background: var(--cu-cream); }
        .ai-badge {
          display: inline-flex; align-items: center; gap: 2px;
          font-size: 7.5pt; color: var(--cu-pink);
          background: var(--cu-pink-light); border: 1px solid var(--cu-pink);
          border-radius: 4px; padding: 1px 5px; vertical-align: middle; margin-left: 4px;
        }
        .notes-box {
          border: 1px solid var(--border); border-radius: 6px;
          padding: 8px 12px; min-height: 36px;
          font-size: 10pt; color: var(--text-muted); font-style: italic;
        }
        .signatures { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-top: 16px; }
        .sig-block { text-align: center; }
        .sig-line { border-top: 1px solid #333; margin: 40px 8px 6px; }
        .sig-role { font-size: 9pt; font-weight: 600; }
        .sig-name { font-size: 8.5pt; color: var(--text-muted); margin-top: 2px; min-height: 16px; }
        .sig-date { font-size: 8.5pt; color: var(--text-muted); margin-top: 6px; border-top: 1px dashed var(--border); padding-top: 4px; }
        .page-footer { position: absolute; bottom: 0; left: 0; right: 0; height: 6px; background: var(--cu-pink); }
        @media print {
          body { background: white; padding: 0; }
          .toolbar { display: none; }
          .page { box-shadow: none; margin: 0; width: 100%; min-height: 100vh; }
        }
        @page { size: A4 portrait; margin: 0; }
      `}</style>

      {/* Screen toolbar */}
      <div className="toolbar">
        <h2>ใบเบิกวัสดุอุปกรณ์ #{ticketCode}</h2>
        <button className="btn btn-back" onClick={() => window.history.back()}>← กลับ</button>
        <button className="btn btn-print" onClick={() => window.print()}>🖨 พิมพ์ / บันทึก PDF</button>
      </div>

      {/* A4 page */}
      <div className="page">
        <img
          src="/images/mascot.svg"
          className="watermark"
          alt=""
          aria-hidden="true"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />

        <div className="content">
          {/* Header */}
          <div className="header">
            <div className="logo">🏫</div>
            <div style={{ flex: 1 }}>
              <div className="header-title">ใบเบิกวัสดุอุปกรณ์</div>
              <div className="header-sub">ฝ่ายซ่อมบำรุง · หอพักนิสิต จุฬาลงกรณ์มหาวิทยาลัย</div>
            </div>
            <div className="doc-badge">
              <div>หมายเลขใบเบิก</div>
              <div className="doc-number">REQ-{ticketCode}</div>
              <div>วันที่: {dateStr}</div>
            </div>
          </div>

          {/* Ticket info */}
          <div className="section-label">ข้อมูลการแจ้งซ่อม</div>
          <div className="info-grid">
            <div className="info-row">
              <span className="info-label">เลขที่แจ้งซ่อม</span>
              <span className="info-value highlight">#{ticketCode}</span>
            </div>
            <div className="info-row">
              <span className="info-label">วันที่แจ้ง</span>
              <span className="info-value">{dateStr}</span>
            </div>
            <div className="info-row">
              <span className="info-label">ประเภท</span>
              <span className="info-value">
                <span className="category-badge">{categoryLabel}</span>
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">รายการ</span>
              <span className="info-value">{title}</span>
            </div>
            <div className="info-row">
              <span className="info-label">สถานที่</span>
              <span className="info-value">{location || "-"}</span>
            </div>
            <div className="info-row">
              <span className="info-label">ผู้แจ้ง</span>
              <span className="info-value">{requesterName}</span>
            </div>
            <div className="info-row">
              <span className="info-label">ช่างผู้รับผิดชอบ</span>
              <span className="info-value">{technicianName ?? "-"}</span>
            </div>
            <div className="info-row">
              <span className="info-label">วันนัดซ่อม</span>
              <span className="info-value">{apptStr}</span>
            </div>
          </div>

          {/* Materials table */}
          <div className="section-label">
            รายการวัสดุที่ขอเบิก
            {materials.some((m) => m.source === "ai") && (
              <span className="ai-badge">✨ AI ช่วยแนะนำ</span>
            )}
          </div>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>รายการ / ชื่อวัสดุ</th>
                <th>จำนวน</th>
                <th>หน่วย</th>
                <th>หมายเหตุ</th>
              </tr>
            </thead>
            <tbody>
              {materials.map((m, i) => (
                <tr key={m.id ?? i} className="data-row">
                  <td>{i + 1}</td>
                  <td>
                    {m.name}
                    {m.source === "ai" && <span className="ai-badge">AI</span>}
                  </td>
                  <td>{m.quantity}</td>
                  <td>{m.unit}</td>
                  <td></td>
                </tr>
              ))}
              {Array.from({ length: emptyRowCount }).map((_, i) => (
                <tr key={`empty-${i}`} className="empty-row">
                  <td></td><td></td><td></td><td></td><td></td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Notes */}
          <div className="section-label">หมายเหตุเพิ่มเติม</div>
          <div className="notes-box">
            {materials.length === 0
              ? "— ยังไม่ได้ระบุวัสดุ —"
              : "— กรณีวัสดุในสต็อกไม่เพียงพอ ให้ติดต่อหัวหน้าช่างก่อนดำเนินการ —"}
          </div>

          {/* Signatures */}
          <div className="section-label">ลายเซ็นผู้เกี่ยวข้อง</div>
          <div className="signatures">
            <div className="sig-block">
              <div className="sig-line"></div>
              <div className="sig-role">ผู้เบิก (ช่าง)</div>
              <div className="sig-name">{technicianName ?? ""}</div>
              <div className="sig-date">วันที่ ___/___/______</div>
            </div>
            <div className="sig-block">
              <div className="sig-line"></div>
              <div className="sig-role">หัวหน้าช่าง / ผู้อนุมัติ</div>
              <div className="sig-name"></div>
              <div className="sig-date">วันที่ ___/___/______</div>
            </div>
            <div className="sig-block">
              <div className="sig-line"></div>
              <div className="sig-role">ผู้จ่ายวัสดุ (คลัง)</div>
              <div className="sig-name"></div>
              <div className="sig-date">วันที่ ___/___/______</div>
            </div>
          </div>
        </div>

        <div className="page-footer"></div>
      </div>
    </>
  );
}
