import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore, useTemporal } from '../store/useAppStore'
import { computeSlots } from '../utils/timeSlots'
import { exportXlsx } from '../utils/xlsxParser'
import Button from '../components/common/Button'
import Modal from '../components/common/Modal'
import Input from '../components/common/Input'
import { LogoCube } from '../components/ui/icon-3d-hover'

const MAJOR_COLORS = [
  'bg-blue-500/15 text-blue-300 border-blue-500/25',
  'bg-purple-500/15 text-purple-300 border-purple-500/25',
  'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
  'bg-amber-500/15 text-amber-300 border-amber-500/25',
  'bg-rose-500/15 text-rose-300 border-rose-500/25',
  'bg-cyan-500/15 text-cyan-300 border-cyan-500/25',
]

export default function TimetablePage() {
  const navigate = useNavigate()
  const config = useAppStore((s) => s.config)
  const timetable = useAppStore((s) => s.timetable)
  const updateEntry = useAppStore((s) => s.updateEntry)
  const deleteEntry = useAppStore((s) => s.deleteEntry)
  const moveEntry = useAppStore((s) => s.moveEntry)
  const addEntry = useAppStore((s) => s.addEntry)
  const storeRooms = useAppStore((s) => s.rooms)
  const storeTeachers = useAppStore((s) => s.teachers)
  const temporal = useTemporal()

  const [filter, setFilter] = useState({ major: '', year: '', section: '' })
  const [editModal, setEditModal] = useState(null)
  const [addModal, setAddModal] = useState(null)
  const [dragInfo, setDragInfo] = useState(null)
  const [clashReport, setClashReport] = useState(false)

  const slots = computeSlots(config)
  const days = config.workingDays

  if (!timetable) {
    return (
      <div className="min-h-screen bg-[#06060a] flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-slate-500 text-sm">No timetable generated yet.</p>
          <Button onClick={() => navigate('/generate')}>Go to Generator</Button>
        </div>
      </div>
    )
  }

  const dept = Object.keys(timetable)[0]
  const deptData = timetable[dept]

  const majors = Object.keys(deptData)
  const majorColorMap = {}
  majors.forEach((m, i) => { majorColorMap[m] = MAJOR_COLORS[i % MAJOR_COLORS.length] })

  const filteredMajor = filter.major || majors[0] || ''
  const years = filteredMajor ? Object.keys(deptData[filteredMajor] || {}) : []
  const filteredYear = filter.year || years[0] || ''
  const sections = filteredYear ? Object.keys((deptData[filteredMajor] || {})[filteredYear] || {}) : []
  const filteredSection = filter.section || sections[0] || ''

  const sectionData = deptData[filteredMajor]?.[filteredYear]?.[filteredSection]

  // Clash detection — builds both a quick Set for grid highlighting and a full report
  const clashes = new Set()
  const roomSlotMap = {}   // key → first occupant descriptor
  const roomSlotOccupants = {}  // key → array of {major, year, section, course}

  for (const major of Object.keys(deptData)) {
    for (const year of Object.keys(deptData[major])) {
      for (const sec of Object.keys(deptData[major][year])) {
        for (const day of days) {
          const entries = deptData[major][year][sec][day] || []
          entries.forEach((e) => {
            if (!e.room) return
            const rk = `${day}|${e.time}|${e.room}`
            if (!roomSlotOccupants[rk]) roomSlotOccupants[rk] = []
            roomSlotOccupants[rk].push({ major, year, section: sec, course: e.course, day, time: e.time, room: e.room })
            if (roomSlotMap[rk]) {
              clashes.add(rk)
            } else {
              roomSlotMap[rk] = true
            }
          })
        }
      }
    }
  }

  // Build detailed clash report
  const clashDetails = []
  for (const [rk, occupants] of Object.entries(roomSlotOccupants)) {
    if (occupants.length > 1) {
      clashDetails.push({ day: occupants[0].day, time: occupants[0].time, room: occupants[0].room, occupants })
    }
  }
  // Sort by day then time
  clashDetails.sort((a, b) => days.indexOf(a.day) - days.indexOf(b.day) || a.time.localeCompare(b.time))

  function entryKey(day, entry) { return `${day}|${entry.time}|${entry.room}` }
  function isClash(day, entry) { return clashes.has(entryKey(day, entry)) }

  function handleDragStart(e, { day, entry }) {
    setDragInfo({ day, entry })
    e.dataTransfer.effectAllowed = 'move'
  }

  function handleDrop(e, { day: toDay, time: toTime }) {
    e.preventDefault()
    if (!dragInfo) return
    moveEntry({
      dept,
      major: filteredMajor,
      yearLabel: filteredYear,
      section: filteredSection,
      fromDay: dragInfo.day,
      toDay,
      fromTime: dragInfo.entry.time,
      toTime,
      entry: dragInfo.entry,
    })
    setDragInfo(null)
  }

  function handleDragOver(e) { e.preventDefault(); e.dataTransfer.dropEffect = 'move' }

  function exportJSON() {
    const blob = new Blob([JSON.stringify(timetable, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `timetable_${config.department || 'export'}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-[#06060a]">
      {/* Navbar */}
      <header className="bg-[#0a0a12] border-b border-white/[0.07] sticky top-0 z-10">
        <div className="max-w-full px-5 h-12 flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-2 mr-2">
            <LogoCube size={20} />
            <span className="font-display font-semibold text-white text-sm">TimetableMaker</span>
          </div>

          <div className="w-px h-4 bg-white/10 mx-1" />

          {[
            { value: filter.major || filteredMajor, onChange: (v) => setFilter({ major: v, year: '', section: '' }), options: majors },
            { value: filter.year || filteredYear,   onChange: (v) => setFilter(f => ({ ...f, year: v, section: '' })), options: years },
            { value: filter.section || filteredSection, onChange: (v) => setFilter(f => ({ ...f, section: v })), options: sections },
          ].map((sel, i) => (
            <select key={i} value={sel.value} onChange={(e) => sel.onChange(e.target.value)}
              className="text-xs border border-white/10 rounded-lg px-2.5 py-1.5 bg-[#0e0e18] focus:outline-none focus:ring-1 focus:ring-indigo-500/30 text-slate-300 font-medium hover:border-white/20 transition-all">
              {sel.options.map((o) => <option key={o} className="bg-[#0e0e18]">{o}</option>)}
            </select>
          ))}

          <div className="ml-auto flex items-center gap-1.5">
            <button
              onClick={() => setClashReport(true)}
              className={`flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-all ${
                clashDetails.length > 0
                  ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
              }`}
            >
              {clashDetails.length > 0 ? `⚠ ${clashDetails.length} clash${clashDetails.length > 1 ? 'es' : ''}` : '✓ No clashes'}
            </button>
            <div className="w-px h-4 bg-white/10 mx-0.5" />
            <Button size="sm" variant="ghost" onClick={() => temporal.getState().undo()}>↩</Button>
            <Button size="sm" variant="ghost" onClick={() => temporal.getState().redo()}>↪</Button>
            <div className="w-px h-4 bg-white/10 mx-0.5" />
            <Button size="sm" variant="secondary" onClick={exportJSON}>JSON</Button>
            <Button size="sm" variant="secondary" onClick={() => exportXlsx(timetable, config)}>XLSX</Button>
            <div className="w-px h-4 bg-white/10 mx-0.5" />
            <Button size="sm" variant="secondary" onClick={() => setAddModal({})}>+ Add Class</Button>
            <div className="w-px h-4 bg-white/10 mx-0.5" />
            <Button size="sm" variant="ghost" onClick={() => navigate('/setup')}>Setup</Button>
            <Button size="sm" onClick={() => navigate('/generate')}>Regenerate</Button>
          </div>
        </div>
      </header>

      {/* Grid */}
      <div className="overflow-x-auto px-5 py-6">
        {!sectionData ? (
          <p className="text-slate-500 text-sm italic">No data for this selection.</p>
        ) : (
          <table className="border-collapse text-xs min-w-max">
            <thead>
              <tr>
                <th className="border border-white/[0.07] bg-[#0e0e18] px-4 py-2.5 text-left text-slate-500 font-semibold w-28 sticky left-0 z-10 text-[11px] uppercase tracking-wide">Time</th>
                {days.map((day) => (
                  <th key={day} className="border border-white/[0.07] bg-indigo-500/10 text-indigo-300 font-semibold px-4 py-2.5 text-center min-w-40 text-[11px] uppercase tracking-wide">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(() => {
                const breakStart = config.communalBreak?.start
                let breakInserted = false
                const rows = []
                for (const slot of slots) {
                  if (!breakInserted && breakStart && slot.start >= config.communalBreak.end) {
                    breakInserted = true
                    rows.push(
                      <tr key="communal-break">
                        <td colSpan={days.length + 1} className="border border-white/[0.07] bg-amber-900/10 text-amber-400 text-center py-2 font-medium text-[11px] tracking-wide">
                          {config.communalBreak.label} · {config.communalBreak.start} – {config.communalBreak.end}
                        </td>
                      </tr>
                    )
                  }
                  rows.push(
                    <tr key={slot.id} className="group hover:bg-white/[0.015]">
                      <td className="border border-white/[0.07] bg-[#0e0e18] px-3 py-2 text-slate-500 font-mono sticky left-0 text-center whitespace-nowrap text-[11px]">
                        {slot.start}<br/><span className="text-slate-700">{slot.end}</span>
                      </td>
                      {days.map((day) => {
                        const entries = (sectionData[day] || []).filter((e) => e.time === slot.id)
                        return (
                          <td
                            key={day}
                            className="border border-white/[0.07] p-1.5 align-top relative bg-[#06060a] group-hover:bg-white/[0.01] transition-colors group/cell"
                            style={{ minHeight: '3.5rem' }}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, { day, time: slot.id })}
                          >
                            {entries.map((entry, i) => (
                              <EntryCard
                                key={i}
                                entry={entry}
                                clash={isClash(day, entry)}
                                colorClass={majorColorMap[filteredMajor]}
                                onDragStart={(e) => handleDragStart(e, { day, entry })}
                                onClick={() => setEditModal({ dept, major: filteredMajor, yearLabel: filteredYear, section: filteredSection, day, entry })}
                              />
                            ))}
                            {entries.length === 0 && (
                              <button
                                onClick={() => setAddModal({ day, time: slot.id })}
                                className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/cell:opacity-100 transition-opacity text-slate-700 hover:text-slate-500 text-lg leading-none"
                              >+</button>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  )
                }
                return rows
              })()}
            </tbody>
          </table>
        )}
      </div>

      {editModal && (
        <EditEntryModal
          {...editModal}
          onClose={() => setEditModal(null)}
          onSave={(updates) => {
            updateEntry({ ...editModal, oldCourse: editModal.entry.course, updates })
            setEditModal(null)
          }}
          onDelete={() => {
            deleteEntry({ ...editModal, time: editModal.entry.time, course: editModal.entry.course })
            setEditModal(null)
          }}
        />
      )}

      {addModal !== null && (
        <AddEntryModal
          preDay={addModal.day}
          preTime={addModal.time}
          days={days}
          slots={slots}
          rooms={storeRooms}
          teachers={storeTeachers.filter((t) => t.name.trim())}
          onClose={() => setAddModal(null)}
          onAdd={({ day, entry }) => {
            addEntry({ dept, major: filteredMajor, yearLabel: filteredYear, section: filteredSection, day, entry })
            setAddModal(null)
          }}
        />
      )}

      {clashReport && (
        <ClashReportModal clashDetails={clashDetails} onClose={() => setClashReport(false)} />
      )}
    </div>
  )
}

function EntryCard({ entry, clash, colorClass, onDragStart, onClick }) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      className={`rounded-lg border px-2.5 py-2 mb-1 cursor-pointer hover:brightness-125 transition-all select-none ${
        clash
          ? 'bg-red-500/15 border-red-500/30 text-red-300'
          : colorClass
      }`}
    >
      <p className="font-semibold leading-tight text-[11px]">{entry.course}</p>
      {entry.room && <p className="text-[10px] opacity-60 mt-0.5 leading-tight">{entry.room}</p>}
      {entry.teacher && <p className="text-[10px] opacity-50 mt-0.5 leading-tight italic">{entry.teacher}</p>}
    </div>
  )
}

function ClashReportModal({ clashDetails, onClose }) {
  return (
    <Modal title="Clash Report" onClose={onClose}>
      {clashDetails.length === 0 ? (
        <div className="py-6 flex flex-col items-center gap-3 text-center">
          <div className="w-10 h-10 rounded-full bg-emerald-500/15 flex items-center justify-center text-emerald-400 text-xl">✓</div>
          <p className="text-slate-300 font-medium">No clashes detected</p>
          <p className="text-slate-500 text-xs">All rooms are uniquely assigned across every section and time slot.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-slate-500 pb-1">
            {clashDetails.length} room conflict{clashDetails.length > 1 ? 's' : ''} found — same room booked for multiple sections at the same time.
          </p>
          {clashDetails.map((clash, i) => (
            <div key={i} className="bg-red-500/8 border border-red-500/20 rounded-xl p-3 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-red-300">{clash.day}</span>
                <span className="text-xs text-slate-500 font-mono">{clash.time}</span>
                <span className="ml-auto text-xs bg-red-500/15 text-red-400 px-2 py-0.5 rounded-full border border-red-500/20 font-medium">{clash.room}</span>
              </div>
              <div className="space-y-1">
                {clash.occupants.map((o, j) => (
                  <div key={j} className="flex items-center gap-2 text-xs text-slate-300 pl-1">
                    <span className="w-1 h-1 rounded-full bg-red-400 shrink-0" />
                    <span className="font-medium">{o.course}</span>
                    <span className="text-slate-500">— {o.major} · {o.year} · Sec {o.section}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  )
}

function EditEntryModal({ entry, onClose, onSave, onDelete }) {
  const [course, setCourse] = useState(entry.course)
  const [room, setRoom] = useState(entry.room || '')

  return (
    <Modal
      title="Edit Entry"
      onClose={onClose}
      footer={
        <>
          <Button variant="danger" size="sm" onClick={onDelete}>Delete</Button>
          <Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={() => onSave({ course, room: room || null })}>Save</Button>
        </>
      }
    >
      <div className="space-y-4">
        <p className="text-[11px] text-slate-500 font-mono">{entry.time}</p>
        <Input label="Course Name" value={course} onChange={(e) => setCourse(e.target.value)} />
        <Input label="Room" value={room} onChange={(e) => setRoom(e.target.value)} placeholder="e.g. CR-14-UG Block" />
      </div>
    </Modal>
  )
}

function AddEntryModal({ preDay, preTime, days, slots, rooms, teachers, onClose, onAdd }) {
  const [day, setDay] = useState(preDay || days[0] || '')
  const [slotId, setSlotId] = useState(preTime || slots[0]?.id || '')
  const [course, setCourse] = useState('')
  const [roomId, setRoomId] = useState('__custom__')
  const [customRoom, setCustomRoom] = useState('')
  const [teacherId, setTeacherId] = useState('')

  const selectClass = 'w-full rounded-lg border border-white/10 px-3 py-2 text-sm bg-[#0e0e18] text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/60 transition-all'

  function handleAdd() {
    if (!course.trim()) return
    const roomName = roomId === '__custom__'
      ? customRoom.trim()
      : (rooms.find((r) => r.id === roomId)?.name || '')
    onAdd({
      day,
      entry: {
        time: slotId,
        course: course.trim(),
        room: roomName || null,
        teacher: teachers.find((t) => t.id === teacherId)?.name || null,
      },
    })
  }

  return (
    <Modal
      title="Add Class"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={handleAdd} disabled={!course.trim()}>Add</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Day</label>
            <select className={selectClass} value={day} onChange={(e) => setDay(e.target.value)}>
              {days.map((d) => <option key={d} className="bg-[#0e0e18]">{d}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Time Slot</label>
            <select className={selectClass} value={slotId} onChange={(e) => setSlotId(e.target.value)}>
              {slots.map((s) => <option key={s.id} value={s.id} className="bg-[#0e0e18]">{s.start}–{s.end}</option>)}
            </select>
          </div>
        </div>
        <Input label="Course Name" value={course} onChange={(e) => setCourse(e.target.value)} placeholder="e.g. Data Structures" autoFocus />
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Room</label>
          <select className={selectClass} value={roomId} onChange={(e) => setRoomId(e.target.value)}>
            <option value="__custom__" className="bg-[#0e0e18]">Custom…</option>
            {rooms.map((r) => <option key={r.id} value={r.id} className="bg-[#0e0e18]">{r.name}</option>)}
          </select>
          {roomId === '__custom__' && (
            <Input className="mt-2" value={customRoom} onChange={(e) => setCustomRoom(e.target.value)} placeholder="Room name or leave blank" />
          )}
        </div>
        {teachers.length > 0 && (
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Teacher</label>
            <select className={selectClass} value={teacherId} onChange={(e) => setTeacherId(e.target.value)}>
              <option value="" className="bg-[#0e0e18]">No teacher</option>
              {teachers.map((t) => <option key={t.id} value={t.id} className="bg-[#0e0e18]">{t.name}</option>)}
            </select>
          </div>
        )}
      </div>
    </Modal>
  )
}
