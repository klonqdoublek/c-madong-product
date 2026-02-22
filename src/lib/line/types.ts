export interface BillItem {
  label: string // "ค่าห้อง"
  amount: number // 3500.00
}

export interface BillData {
  billId: string
  month: string // "มกราคม"
  totalAmount: number // 3921.08
  dueRound: number // 1
  dueDate: string // "5 กุมภาพันธ์ 2569"
  dueTime: string // "17.30น."
  studentName: string // "พิชญา พูลเพียร"
  buildingName: string // "ชวนชม"
  roomNumber: string // "1116"
  bedLabel: string // "B"
  items: BillItem[]
  bannerImageUrl?: string
}
