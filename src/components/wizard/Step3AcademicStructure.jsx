import { useState } from 'react'
import { useAppStore } from '../../store/useAppStore'
import Button from '../common/Button'
import Modal from '../common/Modal'
import { InfoIcon } from '../common/Tooltip'

function uid() { return Math.random().toString(36).slice(2) }

function makeCourse(overrides = {}) {
  return { id: uid(), name: '', creditHours: 3, type: 'lecture', labSlots: 2, groups: [], allowedRooms: [], roomConstraint: 'free', ...overrides }
}

// ─── Bulk Add Courses Modal ──────────────────────────────────────────────────
function BulkAddCoursesModal({ onClose, onAdd }) {
  const [text, setText] = useState('')

  const EXAMPLE = `Data Structures and Algorithms
Object Oriented Programming, 3
DSA Lab, 1, lab, 2, Gp-01, Gp-02
OOP Lab, 1, lab, 3, Gp-01, Gp-02
Linear Algebra, 3, lecture`

  function parse() {
    const courses = []
    for (const raw of text.split('\n')) {
      const line = raw.trim()
      if (!line) continue
      const parts = line.split(',').map((p) => p.trim())
      const name = parts[0]
      if (!name) continue
      const creditHours = parseInt(parts[1]) || 3
      const type = (parts[2] || 'lecture').toLowerCase().includes('lab') ? 'lab' : 'lecture'
      const labSlots = type === 'lab' ? (parseInt(parts[3]) || 2) : 2
      const groups = type === 'lab' ? parts.slice(4).filter(Boolean) : parts.slice(3).filter(Boolean)
      courses.push(makeCourse({ name, creditHours, type, labSlots, groups }))
    }
    return courses
  }

  function handleAdd() {
    const courses = parse()
    if (courses.length) onAdd(courses)
    onClose()
  }

  const preview = parse()

  return (
    <Modal
      title="Bulk Add Courses"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={handleAdd} disabled={preview.length === 0}>
            Add {preview.length > 0 ? `${preview.length} course${preview.length > 1 ? 's' : ''}` : ''}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="bg-white/[0.04] rounded-lg p-3 text-xs border border-white/10">
          <p className="font-semibold text-slate-300 mb-1">Format — one course per line:</p>
          <p className="font-mono text-slate-500">Course Name</p>
          <p className="font-mono text-slate-500">Course Name, credit hours</p>
          <p className="font-mono text-slate-500">Course Name, credit hours, lecture</p>
          <p className="font-mono text-slate-500">Course Name, credit hours, lab, lab slots, Gp-01, Gp-02</p>
          <p className="mt-1.5 text-slate-600">Defaults: 3 credit hours, lecture type.</p>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-slate-300">Courses</label>
            <button className="text-xs text-indigo-400 hover:text-indigo-300" onClick={() => setText(EXAMPLE)}>
              Load example
            </button>
          </div>
          <textarea
            className="w-full h-48 border border-white/10 rounded-lg px-3 py-2 text-sm font-mono bg-white/[0.04] text-slate-200 placeholder:text-white/15 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/60 resize-none transition-all"
            placeholder={`Data Structures and Algorithms\nDSA Lab, 1, lab, 2, Gp-01, Gp-02\nObject Oriented Programming, 3`}
            value={text}
            onChange={(e) => setText(e.target.value)}
            autoFocus
          />
        </div>
        {preview.length > 0 && (
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1.5">Preview ({preview.length} courses)</p>
            <div className="space-y-1 max-h-36 overflow-y-auto">
              {preview.map((c, i) => (
                <div key={i} className="flex items-center gap-2 text-xs bg-indigo-500/10 text-indigo-300 px-2 py-1 rounded">
                  <span className="font-medium flex-1">{c.name}</span>
                  <span className="text-indigo-400">{c.creditHours} hr{c.creditHours > 1 ? 's' : ''}</span>
                  <span className={`px-1.5 py-0.5 rounded-full ${c.type === 'lab' ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'}`}>
                    {c.type}
                  </span>
                  {c.groups.length > 0 && <span className="text-indigo-400">{c.groups.join(', ')}</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}

// ─── Bulk Add Majors Modal ───────────────────────────────────────────────────
function BulkAddMajorsModal({ onClose, onAdd }) {
  const [text, setText] = useState('')

  function parse() {
    const majors = []
    for (const raw of text.split('\n')) {
      const line = raw.trim()
      if (!line) continue
      const parts = line.split(/\s+/)
      const name = parts[0].toUpperCase()
      if (!name) continue
      const sections = parts.slice(1).map((s) => s.toUpperCase()).filter(Boolean)
      majors.push({ id: uid(), name, sections, courses: [] })
    }
    return majors
  }

  function handleAdd() {
    const majors = parse()
    if (majors.length) onAdd(majors)
    onClose()
  }

  const preview = parse()

  return (
    <Modal
      title="Bulk Add Majors"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={handleAdd} disabled={preview.length === 0}>
            Add {preview.length > 0 ? `${preview.length} major${preview.length > 1 ? 's' : ''}` : ''}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="bg-white/[0.04] rounded-lg p-3 text-xs border border-white/10">
          <p className="font-semibold text-slate-300 mb-1">Format — one major per line:</p>
          <p className="font-mono text-slate-500">BSCS</p>
          <p className="font-mono text-slate-500">BSEE A B C</p>
          <p className="mt-1.5 text-slate-600">Sections are optional — type them after the major name separated by spaces.</p>
        </div>
        <div>
          <textarea
            className="w-full h-36 border border-white/10 rounded-lg px-3 py-2 text-sm font-mono bg-white/[0.04] text-slate-200 placeholder:text-white/15 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/60 resize-none transition-all"
            placeholder={`BSCS A B C\nBSEE A B\nBSSE`}
            value={text}
            onChange={(e) => setText(e.target.value)}
            autoFocus
          />
        </div>
        {preview.length > 0 && (
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1.5">Preview ({preview.length} majors)</p>
            <div className="space-y-1 max-h-36 overflow-y-auto">
              {preview.map((m, i) => (
                <div key={i} className="flex items-center gap-2 text-xs bg-indigo-500/10 text-indigo-300 px-2 py-1 rounded">
                  <span className="font-semibold flex-1">{m.name}</span>
                  {m.sections.length > 0
                    ? <span className="text-indigo-400">Sections: {m.sections.join(', ')}</span>
                    : <span className="text-slate-600 italic">no sections</span>
                  }
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}

// ─── Section adder ───────────────────────────────────────────────────────────
function SectionAdder({ sections, onUpdate }) {
  const [input, setInput] = useState('')

  function addSections() {
    const toAdd = input
      .split(/[\s,]+/)
      .map((s) => s.trim().toUpperCase())
      .filter((s) => s && !sections.includes(s))
    if (!toAdd.length) return
    onUpdate({ sections: [...sections, ...toAdd] })
    setInput('')
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-slate-500 font-medium shrink-0">
        Sections
        <InfoIcon tooltip="Class sections for this major (e.g. A, B, C). Each section gets its own independent timetable. Leave empty to use a single default section A." />
        :
      </span>
      {sections.map((s) => (
        <span key={s} className="inline-flex items-center gap-1 bg-indigo-500/20 text-indigo-300 text-xs px-2 py-0.5 rounded-full font-medium">
          {s}
          <button onClick={() => onUpdate({ sections: sections.filter((x) => x !== s) })} className="hover:text-red-400 leading-none ml-0.5">×</button>
        </span>
      ))}
      {sections.length === 0 && (
        <span className="text-xs text-slate-700 italic">defaults to A</span>
      )}
      <div className="flex items-center gap-1">
        <input
          className="border border-dashed border-white/10 rounded-full text-xs px-2 py-0.5 w-28 bg-transparent text-slate-300 placeholder:text-white/15 focus:outline-none focus:border-indigo-500/50"
          placeholder="A, B, C or just A"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') addSections() }}
        />
        {input && (
          <button onClick={addSections} className="text-xs text-indigo-400 hover:text-indigo-300 font-medium">Add</button>
        )}
      </div>
    </div>
  )
}

// ─── Course row ──────────────────────────────────────────────────────────────
function CourseRow({ course, onUpdate, onRemove }) {
  return (
    <tr className="hover:bg-white/[0.03] group">
      <td className="px-2 py-1.5">
        <input
          className="w-full text-sm border-0 bg-transparent text-slate-200 placeholder:text-white/15 focus:outline-none focus:ring-1 focus:ring-indigo-500/40 rounded px-1"
          value={course.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          placeholder="e.g. Data Structures"
        />
      </td>
      <td className="px-2 py-1.5 w-16">
        <input
          type="number" min={1} max={6}
          className="w-full text-sm border-0 bg-transparent text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500/40 rounded px-1 text-center"
          value={course.creditHours}
          onChange={(e) => onUpdate({ creditHours: Number(e.target.value) })}
        />
      </td>
      <td className="px-2 py-1.5 w-24">
        <select
          className="w-full text-sm border-0 bg-transparent text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500/40 rounded"
          value={course.type}
          onChange={(e) => onUpdate({ type: e.target.value })}
        >
          <option value="lecture" className="bg-[#0e0e18]">Lecture</option>
          <option value="lab" className="bg-[#0e0e18]">Lab</option>
        </select>
      </td>
      <td className="px-2 py-1.5 w-20">
        {course.type === 'lab' ? (
          <input
            type="number" min={2} max={4}
            className="w-full text-sm border-0 bg-transparent text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500/40 rounded px-1 text-center"
            value={course.labSlots || 2}
            onChange={(e) => onUpdate({ labSlots: Number(e.target.value) })}
          />
        ) : (
          <span className="block text-center text-slate-700 text-xs">—</span>
        )}
      </td>
      <td className="px-2 py-1.5">
        <input
          className="w-full text-sm border-0 bg-transparent text-slate-200 placeholder:text-white/15 focus:outline-none focus:ring-1 focus:ring-indigo-500/40 rounded px-1"
          value={(course.groups || []).join(', ')}
          onChange={(e) =>
            onUpdate({ groups: e.target.value.split(',').map((g) => g.trim()).filter(Boolean) })
          }
          placeholder={course.type === 'lab' ? 'Gp-01, Gp-02' : '—'}
        />
      </td>
      <td className="px-2 py-1.5 w-8">
        <button onClick={onRemove} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition text-lg leading-none">×</button>
      </td>
    </tr>
  )
}

// ─── Major block ─────────────────────────────────────────────────────────────
function MajorBlock({ major, yearId, onUpdate, onRemove, addCourse, updateCourse, removeCourse }) {
  const [open, setOpen] = useState(true)
  const [bulkCoursesOpen, setBulkCoursesOpen] = useState(false)

  function handleBulkAdd(courses) {
    courses.forEach((c) => addCourse(yearId, major.id, c))
  }

  return (
    <div className="border border-white/[0.07] rounded-xl overflow-hidden">
      <div className="bg-white/[0.03] px-4 py-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setOpen(!open)}
              className={`transition-transform text-slate-500 text-xs ${open ? 'rotate-90' : ''}`}
            >▶</button>
            <input
              className="bg-white/[0.06] border border-white/10 focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/20 rounded-lg px-2 py-1 font-semibold text-sm text-white w-32 uppercase placeholder:text-white/15"
              value={major.name}
              onChange={(e) => onUpdate({ name: e.target.value.toUpperCase() })}
              placeholder="e.g. BSCS"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <button onClick={onRemove} className="text-red-400 hover:text-red-300 text-lg leading-none">×</button>
        </div>
        <SectionAdder sections={major.sections || []} onUpdate={onUpdate} />
      </div>

      {open && (
        <div className="p-3">
          {(major.courses || []).length === 0 ? (
            <p className="text-xs text-slate-600 italic px-2 py-2">No courses yet — add one below or use Bulk Add.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-500 border-b border-white/[0.07]">
                  <th className="text-left px-2 py-1 font-medium">
                    <span className="inline-flex items-center gap-0.5">Course Name<InfoIcon tooltip="Full name of the course as it should appear on the timetable." /></span>
                  </th>
                  <th className="text-center px-2 py-1 font-medium w-16">
                    <span className="inline-flex items-center justify-center gap-0.5">Hrs<InfoIcon tooltip="Credit hours. A 3-credit lecture is spread across 3 separate 1-slot sessions per week." /></span>
                  </th>
                  <th className="text-center px-2 py-1 font-medium w-24">
                    <span className="inline-flex items-center justify-center gap-0.5">Type<InfoIcon tooltip="Lecture: scheduled as individual slots across the week. Lab: scheduled as a single consecutive block (e.g. 2–3 slots in a row)." /></span>
                  </th>
                  <th className="text-center px-2 py-1 font-medium w-20">
                    <span className="inline-flex items-center justify-center gap-0.5">Lab Slots<InfoIcon tooltip="Only for Lab courses. How many back-to-back slots the lab session needs (usually 2 or 3)." /></span>
                  </th>
                  <th className="text-left px-2 py-1 font-medium">
                    <span className="inline-flex items-center gap-0.5">Groups<InfoIcon tooltip="Optional. If the section is split into parallel sub-batches (e.g. Gp-01 and Gp-02 going to the same lab at different times), list them here comma-separated. Leave empty if the whole section attends together." /></span>
                  </th>
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody>
                {(major.courses || []).map((course) => (
                  <CourseRow
                    key={course.id}
                    course={course}
                    onUpdate={(u) => updateCourse(yearId, major.id, course.id, u)}
                    onRemove={() => removeCourse(yearId, major.id, course.id)}
                  />
                ))}
              </tbody>
            </table>
          )}
          <div className="mt-2 flex items-center gap-3">
            <button
              onClick={() => addCourse(yearId, major.id, makeCourse())}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
            >
              + Add Course
            </button>
            <button
              onClick={() => setBulkCoursesOpen(true)}
              className="text-xs text-slate-500 hover:text-indigo-400 font-medium flex items-center gap-1 border border-white/10 rounded-lg px-2 py-1 hover:border-indigo-500/30 transition"
            >
              ⚡ Bulk Add
            </button>
          </div>
        </div>
      )}

      {bulkCoursesOpen && (
        <BulkAddCoursesModal onClose={() => setBulkCoursesOpen(false)} onAdd={handleBulkAdd} />
      )}
    </div>
  )
}

// ─── Main step ───────────────────────────────────────────────────────────────
export default function Step3AcademicStructure({ onNext, onBack }) {
  const years = useAppStore((s) => s.years)
  const addYear = useAppStore((s) => s.addYear)
  const updateYear = useAppStore((s) => s.updateYear)
  const removeYear = useAppStore((s) => s.removeYear)
  const addMajor = useAppStore((s) => s.addMajor)
  const updateMajor = useAppStore((s) => s.updateMajor)
  const removeMajor = useAppStore((s) => s.removeMajor)
  const addCourse = useAppStore((s) => s.addCourse)
  const updateCourse = useAppStore((s) => s.updateCourse)
  const removeCourse = useAppStore((s) => s.removeCourse)
  const [openYears, setOpenYears] = useState({})
  const [bulkMajorsYearId, setBulkMajorsYearId] = useState(null)
  const [warnEmpty, setWarnEmpty] = useState(false)

  function handleAddYear() {
    const id = uid()
    addYear({ id, intake: '', label: '', majors: [] })
    setOpenYears((p) => ({ ...p, [id]: true }))
  }

  function checkEmptyFields() {
    for (const year of years) {
      if (!year.intake.trim() || !year.label.trim()) return true
      for (const major of year.majors || []) {
        if (!major.name.trim()) return true
        for (const course of major.courses || []) {
          if (!course.name.trim()) return true
        }
      }
    }
    return false
  }

  function handleNext() {
    if (checkEmptyFields() && !warnEmpty) {
      setWarnEmpty(true)
      return
    }
    setWarnEmpty(false)
    onNext()
  }

  return (
    <div>
      <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-2">Step 3</p>
      <h2 className="font-display text-3xl font-semibold text-white mb-1">Academic Structure</h2>
      <p className="text-slate-500 text-sm mb-8">
        Each section gets its own independent timetable. A 3-credit course means 3 separate sessions spread across the week — not one block. Use ⚡ Bulk Add on any major for faster entry.
      </p>

      <div className="space-y-4">
        {years.map((year) => {
          const isOpen = openYears[year.id] !== false
          return (
            <div key={year.id} className="bg-[#0e0e18] rounded-2xl border border-white/[0.07] overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-3 bg-indigo-500/10 border-b border-indigo-500/20">
                <button
                  onClick={() => setOpenYears((p) => ({ ...p, [year.id]: !isOpen }))}
                  className={`transition-transform text-indigo-400 text-xs ${isOpen ? 'rotate-90' : ''}`}
                >▶</button>
                <div className="flex gap-3 flex-1 items-center">
                  <div className="flex flex-col gap-0.5">
                    <label className="text-[10px] text-indigo-400/70 font-medium">
                      Intake Code
                      <InfoIcon tooltip="The batch identifier used in the timetable header, e.g. 2K25 for the batch that joined in 2025." />
                    </label>
                    <input
                      className="border border-indigo-500/30 rounded-lg px-2 py-1 text-sm font-mono text-white bg-white/[0.06] focus:outline-none focus:ring-2 focus:ring-indigo-500/30 w-20 placeholder:text-white/15"
                      value={year.intake}
                      onChange={(e) => updateYear(year.id, { intake: e.target.value.toUpperCase() })}
                      placeholder="2K25"
                    />
                  </div>
                  <div className="flex flex-col gap-0.5 flex-1">
                    <label className="text-[10px] text-indigo-400/70 font-medium">
                      Year Label
                      <InfoIcon tooltip="Human-readable label for this cohort, e.g. Year 1 – Freshman. Used as a display heading in the timetable." />
                    </label>
                    <input
                      className="border border-indigo-500/30 rounded-lg px-2 py-1 text-sm text-white flex-1 bg-white/[0.06] focus:outline-none focus:ring-2 focus:ring-indigo-500/30 placeholder:text-white/15"
                      value={year.label}
                      onChange={(e) => updateYear(year.id, { label: e.target.value })}
                      placeholder="Year 1 – Freshman"
                    />
                  </div>
                </div>
                <button onClick={() => removeYear(year.id)} className="text-red-400 hover:text-red-300 text-lg leading-none">×</button>
              </div>

              {isOpen && (
                <div className="p-4 space-y-3">
                  {(year.majors || []).map((major) => (
                    <MajorBlock
                      key={major.id}
                      major={major}
                      yearId={year.id}
                      onUpdate={(u) => updateMajor(year.id, major.id, u)}
                      onRemove={() => removeMajor(year.id, major.id)}
                      addCourse={addCourse}
                      updateCourse={updateCourse}
                      removeCourse={removeCourse}
                    />
                  ))}
                  <div className="flex gap-2">
                    <button
                      onClick={() => addMajor(year.id, { id: uid(), name: '', sections: [], courses: [] })}
                      className="flex-1 text-sm text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 border border-dashed border-indigo-500/30 rounded-xl px-4 py-2 justify-center hover:bg-indigo-500/10 transition"
                    >
                      + Add Major
                    </button>
                    <button
                      onClick={() => setBulkMajorsYearId(year.id)}
                      className="text-xs text-slate-500 hover:text-indigo-400 font-medium flex items-center gap-1.5 border border-white/10 rounded-xl px-3 py-2 hover:border-indigo-500/30 transition"
                    >
                      ⚡ Bulk Add Majors
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}

        <button
          onClick={handleAddYear}
          className="w-full border-2 border-dashed border-white/10 rounded-2xl py-4 text-sm text-slate-500 hover:border-indigo-500/40 hover:text-indigo-400 hover:bg-indigo-500/5 transition font-medium flex items-center justify-center gap-2"
        >
          + Add Intake Year
        </button>
      </div>

      {warnEmpty && (
        <div className="mt-5 bg-amber-900/10 border border-amber-400/20 rounded-xl px-4 py-3 text-sm text-amber-400/80">
          Some fields are still empty (intake code, year label, major name, or course name). These will be blank on the timetable.
        </div>
      )}

      <div className="mt-4 flex justify-between">
        <Button variant="secondary" onClick={onBack}>← Back</Button>
        <Button onClick={handleNext} disabled={years.length === 0}>
          {warnEmpty ? 'Proceed Anyway →' : 'Next: Teachers →'}
        </Button>
      </div>

      {bulkMajorsYearId && (
        <BulkAddMajorsModal
          onClose={() => setBulkMajorsYearId(null)}
          onAdd={(majors) => majors.forEach((m) => addMajor(bulkMajorsYearId, m))}
        />
      )}
    </div>
  )
}
