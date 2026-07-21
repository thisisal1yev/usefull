import { useEffect, useState } from 'react'
import { api } from '../api'

export interface TeacherCard {
  user_id: string
  bio: string
  status: string
  user: { id: string; first_name: string; username: string | null }
}

export interface Slot {
  id: string
  teacher_id: string
  starts_at: string
  ends_at: string
}

interface BookingRow {
  id: string
  slot: { starts_at: string; teacher: { user: { first_name: string } } } | null
}

const fmt = (iso: string) => new Date(iso).toLocaleString()

const hasBooking = (b: unknown): boolean => (Array.isArray(b) ? b.length > 0 : b != null)

export default function LessonsScreen() {
  const [teachers, setTeachers] = useState<TeacherCard[] | null>(null)
  const [openTeacher, setOpenTeacher] = useState<string | null>(null)
  const [slots, setSlots] = useState<Record<string, Slot[]>>({})
  const [bookings, setBookings] = useState<BookingRow[]>([])
  const [meTeacher, setMeTeacher] = useState<{ status: string } | null>(null)
  const [mySlots, setMySlots] = useState<Array<Slot & { bookings: unknown }>>([])
  const [slotDraft, setSlotDraft] = useState('')
  const [notice, setNotice] = useState<string | null>(null)

  const loadBookings = () => {
    api<BookingRow[]>('/api/bookings').then(setBookings).catch(() => setBookings([]))
  }
  const loadMySlots = () => {
    api<Array<Slot & { bookings: unknown }>>('/api/slots/mine').then(setMySlots).catch(() => setMySlots([]))
  }

  useEffect(() => {
    api<TeacherCard[]>('/api/teachers').then(setTeachers).catch(() => setTeachers([]))
    api<{ status: string } | null>('/api/teachers/me').then((p) => {
      setMeTeacher(p)
      if (p?.status === 'approved') loadMySlots()
    }).catch(() => setMeTeacher(null))
    loadBookings()
  }, [])

  const openSlots = async (teacherId: string) => {
    if (openTeacher === teacherId) { setOpenTeacher(null); return }
    setOpenTeacher(teacherId)
    const list = await api<Slot[]>(`/api/teachers/${teacherId}/slots`).catch(() => [])
    setSlots((s) => ({ ...s, [teacherId]: list }))
  }

  const book = async (teacherId: string, slotId: string) => {
    try {
      await api('/api/bookings', { method: 'POST', body: JSON.stringify({ slotId }) })
      setNotice('Band qilindi ✅')
      loadBookings()
      const list = await api<Slot[]>(`/api/teachers/${teacherId}/slots`).catch(() => [])
      setSlots((s) => ({ ...s, [teacherId]: list }))
    } catch (e) {
      setNotice(
        String(e).includes('403')
          ? 'Haftalik bepul limit tugadi. Premium tez orada! ⭐'
          : "Band qilib bo'lmadi — slot allaqachon olingan bo'lishi mumkin.",
      )
    }
  }

  const cancelBooking = async (id: string) => {
    await api(`/api/bookings/${id}`, { method: 'DELETE' }).catch(() => undefined)
    loadBookings()
  }

  const addSlot = async () => {
    if (!slotDraft) return
    await api('/api/slots', {
      method: 'POST',
      body: JSON.stringify({ startsAt: new Date(slotDraft).toISOString() }),
    }).catch(() => undefined)
    setSlotDraft('')
    loadMySlots()
  }

  const deleteSlot = async (id: string) => {
    await api(`/api/slots/${id}`, { method: 'DELETE' }).catch(() => undefined)
    loadMySlots()
  }

  return (
    <div className="px-3 py-2">
      {notice && (
        <div className="mb-2 rounded-xl bg-tg-secondary p-3 text-sm" onClick={() => setNotice(null)}>
          {notice}
        </div>
      )}

      <h2 className="mt-2 mb-1 text-sm font-semibold text-tg-hint">O'qituvchilar</h2>
      {teachers === null ? (
        <div className="py-4 text-center text-tg-hint">Yuklanmoqda…</div>
      ) : teachers.length === 0 ? (
        <div className="py-4 text-center text-tg-hint">Hozircha o'qituvchilar yo'q</div>
      ) : (
        teachers.map((t) => (
          <div className="mb-2 rounded-xl bg-tg-secondary p-3" key={t.user_id}>
            <div className="font-semibold" onClick={() => openSlots(t.user_id)}>
              {t.user.first_name}
            </div>
            <div className="mt-1 text-xs text-tg-hint">{t.bio}</div>
            {openTeacher === t.user_id && (
              <div className="mt-2">
                {(slots[t.user_id] ?? []).length === 0 ? (
                  <div className="text-xs text-tg-hint">Bo'sh slotlar yo'q</div>
                ) : (
                  (slots[t.user_id] ?? []).map((s) => (
                    <div className="mt-1 flex items-center justify-between rounded-lg bg-tg-bg p-2" key={s.id}>
                      <span className="text-sm">{fmt(s.starts_at)}</span>
                      <button
                        className="rounded-lg bg-tg-button px-3 py-1.5 text-sm font-semibold text-tg-button-text"
                        onClick={() => book(t.user_id, s.id)}
                      >
                        Band qilish
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        ))
      )}

      <h2 className="mt-4 mb-1 text-sm font-semibold text-tg-hint">Mening darslarim</h2>
      {bookings.length === 0 ? (
        <div className="py-4 text-center text-tg-hint">Darslar yo'q</div>
      ) : (
        bookings.map((b) => (
          <div className="mb-2 rounded-xl bg-tg-secondary p-3" key={b.id}>
            <div className="text-sm">
              {b.slot ? `${b.slot.teacher.user.first_name} · ${fmt(b.slot.starts_at)}` : '—'}
            </div>
            <button
              className="mt-2 rounded-lg border border-tg-hint/50 px-3 py-1.5 text-sm text-tg-text"
              onClick={() => cancelBooking(b.id)}
            >
              Bekor qilish
            </button>
          </div>
        ))
      )}

      {meTeacher?.status === 'approved' && (
        <>
          <h2 className="mt-4 mb-1 text-sm font-semibold text-tg-hint">Mening slotlarim</h2>
          <input
            type="datetime-local"
            className="w-full rounded-lg border border-tg-hint/50 bg-tg-bg p-2.5 text-tg-text"
            value={slotDraft}
            onChange={(e) => setSlotDraft(e.target.value)}
          />
          <button
            className="mt-2 w-full rounded-lg bg-tg-button p-2.5 text-sm font-semibold text-tg-button-text"
            onClick={addSlot}
          >
            Slot qo'shish
          </button>
          {mySlots.map((s) => (
            <div className="mt-2 flex items-center justify-between rounded-xl bg-tg-secondary p-3" key={s.id}>
              <span className="text-sm">
                {fmt(s.starts_at)}
                {hasBooking(s.bookings) ? ' · band' : ''}
              </span>
              {!hasBooking(s.bookings) && (
                <button
                  className="rounded-lg border border-tg-hint/50 px-3 py-1.5 text-sm text-tg-text"
                  onClick={() => deleteSlot(s.id)}
                >
                  O'chirish
                </button>
              )}
            </div>
          ))}
        </>
      )}
    </div>
  )
}
