import { useState } from 'react'
import { useAppStore } from '../../store/useAppStore'
import Button from '../common/Button'

function uid() { return Math.random().toString(36).slice(2) }

function TeacherRow({ teacher, autoFocus, onUpdate, onRemove }) {
  const named = teacher.name.trim().length > 0
  return (
    <div className={`flex items-center gap-2.5 rounded-xl border px-3 py-2 transition-all duration-150 ${
      named
        ? 'bg-indigo-500/10 border-indigo-500/25'
        : 'bg-white/[0.03] border-dashed border-white/15'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors duration-150 ${named ? 'bg-indigo-400' : 'bg-white/20'}`} />
      <input
        autoFocus={autoFocus}
        className="flex-1 bg-transparent text-sm text-white placeholder:text-white/15 focus:outline-none"
        value={teacher.name}
        onChange={(e) => onUpdate({ name: e.target.value })}
        onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur() }}
        onBlur={() => { if (!teacher.name.trim()) onRemove() }}
        placeholder="Type name and press Enter…"
      />
      {named && (
        <button
          onClick={onRemove}
          className="text-slate-600 hover:text-red-400 text-lg leading-none transition-colors"
        >×</button>
      )}
    </div>
  )
}

export default function Step4Teachers({ onNext, onBack }) {
  const teachers = useAppStore((s) => s.teachers)
  const years = useAppStore((s) => s.years)
  const addTeacher = useAppStore((s) => s.addTeacher)
  const updateTeacher = useAppStore((s) => s.updateTeacher)
  const removeTeacher = useAppStore((s) => s.removeTeacher)
  const updateCourse = useAppStore((s) => s.updateCourse)

  const [newTeacherId, setNewTeacherId] = useState(null)

  function handleAddTeacher() {
    const id = uid()
    addTeacher({ id, name: '' })
    setNewTeacherId(id)
  }

  // Only named teachers appear in dropdowns
  const namedTeachers = teachers.filter((t) => t.name.trim())

  // Flatten all courses for the assignment table
  const hasAnyCourses = years.some((y) => (y.majors || []).some((m) => (m.courses || []).length > 0))

  return (
    <div>
      <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-2">Step 4</p>
      <h2 className="font-display text-3xl font-semibold text-white mb-1">Teachers</h2>
      <p className="text-slate-500 text-sm mb-8">
        Optional — skip entirely if teacher scheduling isn't a concern. You can assign the same teacher to courses across different years and majors; they just won't be placed in two rooms at the same time. Unassigned courses schedule freely with no teacher constraint.
      </p>

      {/* Teacher roster */}
      <div className="bg-[#0e0e18] rounded-2xl border border-white/[0.07] p-5 mb-5">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">Teacher Roster</p>

        {teachers.length === 0 ? (
          <p className="text-xs text-slate-600 italic mb-4">No teachers added yet.</p>
        ) : (
          <div className="space-y-2 mb-4">
            {teachers.map((t) => (
              <TeacherRow
                key={t.id}
                teacher={t}
                autoFocus={t.id === newTeacherId}
                onUpdate={(updates) => updateTeacher(t.id, updates)}
                onRemove={() => removeTeacher(t.id)}
              />
            ))}
          </div>
        )}

        <button
          onClick={handleAddTeacher}
          className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 transition-colors"
        >
          + Add Teacher
        </button>
      </div>

      {/* Course assignments — only shown when there are named teachers and courses */}
      {hasAnyCourses && (
        <div className="bg-[#0e0e18] rounded-2xl border border-white/[0.07] p-5 mb-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">Course Assignments</p>

          {namedTeachers.length === 0 ? (
            <p className="text-xs text-slate-600 italic">Add and name teachers above to assign them to courses.</p>
          ) : (
            <div className="space-y-5">
              {years.map((year) => {
                const hasCourses = (year.majors || []).some((m) => (m.courses || []).length > 0)
                if (!hasCourses) return null
                return (
                  <div key={year.id}>
                    <p className="text-xs font-semibold text-indigo-400 mb-2">{year.label || year.intake}</p>
                    <div className="space-y-3 pl-2">
                      {(year.majors || []).map((major) => {
                        if (!(major.courses || []).length) return null
                        return (
                          <div key={major.id}>
                            <p className="text-xs text-slate-400 font-medium mb-1.5">{major.name}</p>
                            <div className="space-y-1">
                              {major.courses.map((course) => (
                                <div key={course.id} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/[0.03] transition-colors">
                                  <span className="text-sm text-slate-200 flex-1 min-w-0 truncate">
                                    {course.name || <span className="text-slate-600 italic">Unnamed course</span>}
                                  </span>
                                  <select
                                    className="text-xs border border-white/10 rounded-lg px-2 py-1.5 bg-[#0e0e18] text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 hover:border-white/20 transition-all shrink-0"
                                    value={course.teacherId || ''}
                                    onChange={(e) =>
                                      updateCourse(year.id, major.id, course.id, { teacherId: e.target.value || null })
                                    }
                                  >
                                    <option value="">No teacher</option>
                                    {namedTeachers.map((t) => (
                                      <option key={t.id} value={t.id} className="bg-[#0e0e18]">
                                        {t.name}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {!hasAnyCourses && (
        <div className="bg-amber-900/10 border border-amber-400/20 rounded-xl p-4 text-sm text-amber-400/80 mb-5">
          No courses found. Go back to Step 3 to add courses before assigning teachers.
        </div>
      )}

      <div className="mt-6 flex justify-between">
        <Button variant="secondary" onClick={onBack}>← Back</Button>
        <Button onClick={onNext}>Next: Rooms →</Button>
      </div>
    </div>
  )
}
