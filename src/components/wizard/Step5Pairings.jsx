import { useState } from 'react'
import { useAppStore } from '../../store/useAppStore'
import Button from '../common/Button'
import { useNavigate } from 'react-router-dom'

const CONSTRAINT_LABELS = {
  free: { label: 'Free', color: 'bg-white/[0.08] text-slate-400' },
  restricted: { label: 'Restricted', color: 'bg-amber-500/15 text-amber-400' },
  exclusive: { label: 'Exclusive', color: 'bg-red-500/15 text-red-400' },
}

export default function Step5Pairings({ onBack }) {
  const years = useAppStore((s) => s.years)
  const rooms = useAppStore((s) => s.rooms)
  const updateCourse = useAppStore((s) => s.updateCourse)
  const navigate = useNavigate()
  const [selected, setSelected] = useState(null)

  const allCourses = []
  for (const year of years) {
    for (const major of year.majors || []) {
      for (const course of major.courses || []) {
        allCourses.push({ ...course, yearId: year.id, yearLabel: year.label, majorId: major.id, majorName: major.name })
      }
    }
  }

  const labCourses = allCourses.filter((c) => c.type === 'lab')
  const lectureCourses = allCourses.filter((c) => c.type === 'lecture')
  const labRooms = rooms.filter((r) => r.type === 'lab')
  const lectureRooms = rooms.filter((r) => r.type !== 'lab')

  const activeCourse = selected ? allCourses.find((c) => c.id === selected.courseId) : null

  function toggleRoom(course, roomId) {
    const current = course.allowedRooms || []
    const updated = current.includes(roomId) ? current.filter((id) => id !== roomId) : [...current, roomId]
    updateCourse(course.yearId, course.majorId, course.id, { allowedRooms: updated })
  }

  function setConstraint(course, val) {
    updateCourse(course.yearId, course.majorId, course.id, { roomConstraint: val })
  }

  function CourseList({ courses, title }) {
    return (
      <div>
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{title}</h4>
        <div className="space-y-1">
          {courses.map((course) => {
            const isSelected = selected?.courseId === course.id
            const hasRestriction = (course.allowedRooms || []).length > 0
            return (
              <button
                key={course.id}
                onClick={() => setSelected(isSelected ? null : { yearId: course.yearId, majorId: course.majorId, courseId: course.id })}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition flex items-center justify-between gap-2 ${
                  isSelected
                    ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                    : 'text-slate-300 hover:bg-white/[0.04] border border-transparent'
                }`}
              >
                <div>
                  <span className="font-medium">{course.name}</span>
                  <span className="ml-1.5 text-xs text-slate-500">{course.majorName} · {course.yearLabel}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {hasRestriction && (
                    <span className="text-xs bg-indigo-500/15 text-indigo-400 px-1.5 py-0.5 rounded-full">
                      {course.allowedRooms.length} room{course.allowedRooms.length > 1 ? 's' : ''}
                    </span>
                  )}
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${CONSTRAINT_LABELS[course.roomConstraint || 'free'].color}`}>
                    {CONSTRAINT_LABELS[course.roomConstraint || 'free'].label}
                  </span>
                </div>
              </button>
            )
          })}
          {courses.length === 0 && <p className="text-xs text-slate-600 italic px-3">None</p>}
        </div>
      </div>
    )
  }

  return (
    <div>
      <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-2">Step 6</p>
      <h2 className="font-display text-3xl font-semibold text-white mb-1">Room–Course Pairings</h2>
      <p className="text-slate-500 text-sm mb-8">
        Optional — safe to skip if room assignment doesn't matter. Useful when a course needs a specific room, like a dedicated computer lab. Restricted locks the course to only the rooms you check; Free ignores any selections and lets the generator pick automatically.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Course list */}
        <div className="bg-[#0e0e18] rounded-2xl border border-white/[0.07] p-4 space-y-4">
          <CourseList courses={labCourses} title="Lab Courses" />
          <CourseList courses={lectureCourses} title="Lecture Courses" />
        </div>

        {/* Room assignment panel */}
        <div className="bg-[#0e0e18] rounded-2xl border border-white/[0.07] p-4">
          {!activeCourse ? (
            <p className="text-sm text-slate-600 italic mt-4">← Select a course to assign rooms</p>
          ) : (
            <div>
              <div className="mb-4">
                <p className="font-semibold text-slate-200">{activeCourse.name}</p>
                <p className="text-xs text-slate-500">{activeCourse.majorName} · {activeCourse.yearLabel} · {activeCourse.type}</p>
              </div>

              <div className="mb-4">
                <p className="text-xs font-medium text-slate-500 mb-2">Constraint Mode</p>
                <div className="flex gap-2">
                  {Object.entries(CONSTRAINT_LABELS).map(([val, { label, color }]) => (
                    <button
                      key={val}
                      onClick={() => setConstraint(activeCourse, val)}
                      className={`text-xs px-3 py-1.5 rounded-lg border transition ${
                        (activeCourse.roomConstraint || 'free') === val
                          ? `${color} border-current font-semibold`
                          : 'border-white/10 text-slate-500 hover:border-white/20'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-xs text-slate-600">
                  {activeCourse.roomConstraint === 'exclusive' && 'Room reserved only for this course.'}
                  {activeCourse.roomConstraint === 'restricted' && 'Can only use the rooms checked below.'}
                  {(!activeCourse.roomConstraint || activeCourse.roomConstraint === 'free') && 'Can use any compatible room. Room selections below are ignored.'}
                </p>
              </div>

              <p className="text-xs font-medium text-slate-500 mb-2">Allowed Rooms</p>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {(activeCourse.type === 'lab' ? labRooms : lectureRooms).map((room) => {
                  const checked = (activeCourse.allowedRooms || []).includes(room.id)
                  return (
                    <label key={room.id} className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-white/[0.04] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleRoom(activeCourse, room.id)}
                        className="accent-indigo-600 w-4 h-4"
                      />
                      <span className="text-sm text-slate-300">{room.name}</span>
                      <span className="ml-auto text-xs text-slate-500">{room.type.replace('_', ' ')}</span>
                    </label>
                  )
                })}
                {(activeCourse.type === 'lab' ? labRooms : lectureRooms).length === 0 && (
                  <p className="text-xs text-slate-600 italic px-2">No compatible rooms found. Add rooms in the previous step.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex justify-between">
        <Button variant="secondary" onClick={onBack}>← Back</Button>
        <Button variant="success" onClick={() => navigate('/generate')}>
          Review & Generate →
        </Button>
      </div>
    </div>
  )
}
