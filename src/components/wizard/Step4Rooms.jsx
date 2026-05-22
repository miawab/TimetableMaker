import { useAppStore } from '../../store/useAppStore'
import Button from '../common/Button'
import { InfoIcon } from '../common/Tooltip'

function uid() { return Math.random().toString(36).slice(2) }

const ROOM_TYPES = [
  { value: 'classroom', label: 'Classroom', color: 'bg-blue-500/10 text-blue-300 border-blue-500/20 hover:bg-blue-500/20' },
  { value: 'lab', label: 'Lab', color: 'bg-purple-500/10 text-purple-300 border-purple-500/20 hover:bg-purple-500/20' },
  { value: 'lecture_hall', label: 'Lecture Hall', color: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20 hover:bg-emerald-500/20' },
]

export default function Step4Rooms({ onNext, onBack }) {
  const rooms = useAppStore((s) => s.rooms)
  const addRoom = useAppStore((s) => s.addRoom)
  const updateRoom = useAppStore((s) => s.updateRoom)
  const removeRoom = useAppStore((s) => s.removeRoom)

  const classrooms = rooms.filter((r) => r.type === 'classroom')
  const labs = rooms.filter((r) => r.type === 'lab')
  const halls = rooms.filter((r) => r.type === 'lecture_hall')

  return (
    <div>
      <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-2">Step 4</p>
      <h2 className="font-display text-3xl font-semibold text-white mb-1">Rooms</h2>
      <p className="text-slate-500 text-sm mb-8">
        List all available rooms. Labs will only be assigned to lab-type courses. Lecture halls can hold any lecture.
      </p>

      <div className="bg-[#0e0e18] rounded-2xl border border-white/[0.07] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-slate-500 border-b border-white/[0.07] bg-white/[0.03]">
              <th className="text-left px-4 py-2.5 font-medium">
                <span className="inline-flex items-center gap-0.5">Room Name<InfoIcon tooltip="The room identifier as it should appear on the timetable, e.g. CR-14-UG Block or Computing Lab-07." /></span>
              </th>
              <th className="text-left px-4 py-2.5 font-medium w-44">
                <span className="inline-flex items-center gap-0.5">Type<InfoIcon tooltip="Classroom: regular lecture room. Lab: only assigned to lab-type courses. Lecture Hall: large shared room, can hold any lecture." /></span>
              </th>
              <th className="w-12" />
            </tr>
          </thead>
          <tbody>
            {rooms.map((room) => (
              <tr key={room.id} className="hover:bg-white/[0.03] group border-b border-white/[0.04]">
                <td className="px-4 py-2">
                  <input
                    className="w-full text-sm border-0 bg-transparent text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/40 rounded px-1"
                    value={room.name}
                    onChange={(e) => updateRoom(room.id, { name: e.target.value })}
                    placeholder="e.g. CR-14-UG Block"
                  />
                </td>
                <td className="px-4 py-2">
                  <select
                    value={room.type}
                    onChange={(e) => updateRoom(room.id, { type: e.target.value })}
                    className="text-xs border border-white/10 rounded-lg px-2 py-1 bg-[#0e0e18] text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
                  >
                    <option value="classroom">Classroom</option>
                    <option value="lab">Lab</option>
                    <option value="lecture_hall">Lecture Hall</option>
                  </select>
                </td>
                <td className="px-4 py-2 text-center">
                  <button
                    onClick={() => removeRoom(room.id)}
                    className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition text-lg leading-none"
                  >×</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="px-4 py-3 border-t border-white/[0.07] flex gap-2">
          {ROOM_TYPES.map((rt) => (
            <button
              key={rt.value}
              onClick={() => addRoom({ id: uid(), name: '', type: rt.value })}
              className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition ${rt.color}`}
            >
              + {rt.label}
            </button>
          ))}
        </div>
      </div>

      {rooms.length > 0 && (
        <div className="mt-4 flex gap-3 text-xs">
          <span className="bg-blue-500/10 border border-blue-500/20 text-blue-300 px-3 py-1 rounded-full">{classrooms.length} Classrooms</span>
          <span className="bg-purple-500/10 border border-purple-500/20 text-purple-300 px-3 py-1 rounded-full">{labs.length} Labs</span>
          <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full">{halls.length} Lecture Halls</span>
        </div>
      )}

      <div className="mt-6 flex justify-between">
        <Button variant="secondary" onClick={onBack}>← Back</Button>
        <Button onClick={onNext} disabled={rooms.length === 0}>
          Next: Pairings →
        </Button>
      </div>
    </div>
  )
}
