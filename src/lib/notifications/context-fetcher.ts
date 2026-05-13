import { createAdminClient } from "@/lib/supabase/admin"

const FETCH_TIMEOUT_MS = 500

type Fallback = { data: null; error: null }

function withTimeout<T>(fn: () => PromiseLike<T>, fallback: Fallback): Promise<T | Fallback> {
  return Promise.race([
    Promise.resolve(fn()),
    new Promise<Fallback>((resolve) => setTimeout(() => resolve(fallback), FETCH_TIMEOUT_MS)),
  ])
}

export interface PendingBill {
  id: string
  totalAmount: number
  dueDate: string
  daysUntilDue: number
  status: string
}

export interface OpenTicket {
  id: string
  ticketCode: string
  title: string
  status: string
  createdAt: string
}

export interface UnclaimedParcel {
  id: string
  parcelType: string
  notifiedAt: string
  hoursWaiting: number
}

export interface UserActiveContext {
  pendingBills: PendingBill[]
  openTickets: OpenTicket[]
  unclaimedParcels: UnclaimedParcel[]
  scoreBelowThreshold: { score: number; threshold: number } | null
  isEmpty: boolean
}

const FALLBACK = { data: null, error: null }

/** Fetch user's active pending state. Mirror of smart-suggestions pattern (500ms timeout, Promise.all). */
export async function getActiveUserContext(lineUid: string): Promise<UserActiveContext> {
  const adminDb = createAdminClient()

  const [profileResult, billsResult, ticketsResult, parcelsResult] = await Promise.all([
    withTimeout(() => adminDb.from("profiles").select("id").eq("line_uid", lineUid).single(), FALLBACK),
    withTimeout(
      () => adminDb
        .from("bills")
        .select("id, total_amount, due_date, status, student_id")
        .in("status", ["pending", "overdue"])
        .order("due_date", { ascending: true })
        .limit(3),
      FALLBACK
    ),
    withTimeout(
      () => adminDb
        .from("maintenance_requests")
        .select("id, ticket_code, title, status, created_at, requester_id")
        .in("status", ["under_review", "acknowledged", "in_progress"])
        .order("created_at", { ascending: false })
        .limit(3),
      FALLBACK
    ),
    withTimeout(
      () => adminDb
        .from("parcels")
        .select("id, parcel_type, notified_at, status, student_id")
        .eq("status", "notified")
        .order("notified_at", { ascending: true })
        .limit(3),
      FALLBACK
    ),
  ])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userId = (profileResult as any).data?.id as string | undefined
  if (!userId) return emptyContext()

  const now = Date.now()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const billsData: any[] = (billsResult as any).data ?? []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ticketsData: any[] = (ticketsResult as any).data ?? []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parcelsData: any[] = (parcelsResult as any).data ?? []

  // Filter bills belonging to this user
  const userBills = billsData
    .filter((b) => b.student_id === userId)
    .map((b) => {
      const dueMs = new Date(b.due_date).getTime()
      const daysUntilDue = Math.ceil((dueMs - now) / (1000 * 60 * 60 * 24))
      return {
        id: b.id as string,
        totalAmount: b.total_amount as number,
        dueDate: b.due_date as string,
        daysUntilDue,
        status: b.status as string,
      }
    })

  // Filter tickets belonging to this user
  const userTickets = ticketsData
    .filter((t) => t.requester_id === userId)
    .map((t) => ({
      id: t.id as string,
      ticketCode: (t.ticket_code ?? "") as string,
      title: t.title as string,
      status: t.status as string,
      createdAt: t.created_at as string,
    }))

  // Filter parcels belonging to this user
  const userParcels = parcelsData
    .filter((p) => p.student_id === userId && p.notified_at)
    .map((p) => {
      const notifiedMs = new Date(p.notified_at as string).getTime()
      const hoursWaiting = Math.floor((now - notifiedMs) / (1000 * 60 * 60))
      return {
        id: p.id as string,
        parcelType: p.parcel_type as string,
        notifiedAt: p.notified_at as string,
        hoursWaiting,
      }
    })

  const ctx: UserActiveContext = {
    pendingBills: userBills,
    openTickets: userTickets,
    unclaimedParcels: userParcels,
    scoreBelowThreshold: null, // score check omitted here — expensive RPC, used by cron only
    isEmpty: userBills.length === 0 && userTickets.length === 0 && userParcels.length === 0,
  }

  return ctx
}

function emptyContext(): UserActiveContext {
  return {
    pendingBills: [],
    openTickets: [],
    unclaimedParcels: [],
    scoreBelowThreshold: null,
    isEmpty: true,
  }
}
