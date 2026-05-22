import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { generateTimetable } from '../utils/generator'
import { computeSlots } from '../utils/timeSlots'
import Button from '../components/common/Button'
import { LogoCube } from '../components/ui/icon-3d-hover'

function Stat({ label, value }) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
      <p className="text-slate-200 font-semibold text-sm">{value || '—'}</p>
    </div>
  )
}

export default function GeneratePage() {
  const navigate = useNavigate()
  const config = useAppStore((s) => s.config)
  const years = useAppStore((s) => s.years)
  const rooms = useAppStore((s) => s.rooms)
  const setTimetable = useAppStore((s) => s.setTimetable)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)

  const slots = computeSlots(config)
  const totalSections = years.reduce((a, y) =>
    a + (y.majors || []).reduce((b, m) => b + (m.sections || []).length, 0), 0)
  const totalUnits = years.reduce((a, y) =>
    a + (y.majors || []).reduce((b, m) =>
      b + (m.courses || []).reduce((c, course) => {
        const g = course.groups?.length || 1
        const s = (m.sections || []).length
        return c + g * s * (course.type === 'lab' ? 1 : (course.creditHours || 3))
      }, 0), 0), 0)

  const noLabRooms = rooms.filter(r => r.type === 'lab').length === 0 &&
    years.some(y => (y.majors || []).some(m => (m.courses || []).some(c => c.type === 'lab')))

  function handleGenerate() {
    setLoading(true)
    setResult(null)
    setProgress(0)
    const interval = setInterval(() => setProgress(p => Math.min(p + Math.random() * 15, 90)), 120)
    setTimeout(() => {
      clearInterval(interval)
      try {
        const { timetable, errors } = generateTimetable(config, years, rooms)
        setTimetable(timetable)
        setProgress(100)
        setResult({ errors, success: errors.length === 0 })
      } catch (e) {
        setResult({ errors: [e.message], success: false })
      }
      setLoading(false)
    }, 50)
  }

  return (
    <div className="min-h-screen bg-[#06060a]">
      <header className="bg-[#0a0a12] border-b border-white/[0.07] sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <LogoCube size={22} />
            <span className="font-display font-semibold text-white tracking-tight">TimetableMaker</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/setup')}>← Setup</Button>
        </div>
        <div className="h-px bg-white/[0.04]">
          {loading && (
            <div className="h-full bg-indigo-500 transition-all duration-200 ease-out" style={{ width: `${progress}%` }} />
          )}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10 space-y-6">
        <div>
          <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-2">Final Step</p>
          <h2 className="font-display text-3xl font-semibold text-white">Review & Generate</h2>
        </div>

        {/* Summary */}
        <div className="bg-[#0e0e18] rounded-2xl border border-white/[0.07] p-6">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-5">Configuration Summary</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-5 gap-x-6">
            <Stat label="University" value={config.university} />
            <Stat label="Department" value={config.department} />
            <Stat label="Days" value={config.workingDays.map(d => d.slice(0,3)).join(', ')} />
            <Stat label="Slots / Day" value={`${slots.length} slots`} />
            <Stat label="Intake Years" value={years.length} />
            <Stat label="Sections" value={totalSections} />
            <Stat label="Rooms" value={rooms.length} />
            <Stat label="Units to Schedule" value={totalUnits} />
          </div>
        </div>

        {noLabRooms && (
          <div className="flex gap-3 items-start bg-amber-900/10 border border-amber-400/20 rounded-xl p-4 text-sm">
            <span className="text-amber-400 text-base mt-0.5">⚠</span>
            <div>
              <p className="font-semibold text-amber-300">No lab rooms added</p>
              <p className="text-amber-400/80 text-xs mt-0.5">Lab courses will fail to schedule. Add at least one Lab room in the Rooms step.</p>
            </div>
          </div>
        )}

        {/* Generate CTA */}
        <div className="bg-[#0e0e18] rounded-2xl border border-white/[0.07] p-8 flex flex-col items-center gap-4 text-center">
          {!loading && !result && (
            <>
              <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-lg">⚡</div>
              <p className="text-slate-400 text-sm">Ready to schedule {totalUnits} course units across {totalSections} sections.</p>
            </>
          )}

          {loading && (
            <div className="w-full max-w-xs">
              <div className="flex justify-between text-xs text-slate-500 mb-2">
                <span>Scheduling...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full transition-all duration-200" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          <Button
            size="lg"
            onClick={handleGenerate}
            disabled={loading || years.length === 0 || rooms.length === 0}
          >
            {loading ? 'Generating…' : result ? 'Regenerate' : 'Generate Timetable'}
          </Button>
        </div>

        {/* Result */}
        {result && (
          result.success ? (
            <div className="bg-emerald-900/10 border border-emerald-400/20 rounded-2xl p-6 flex flex-col items-center gap-4 text-center">
              <div className="w-10 h-10 rounded-full bg-emerald-500/15 flex items-center justify-center text-xl text-emerald-400">✓</div>
              <div>
                <p className="font-semibold text-emerald-300 text-base">Timetable generated successfully</p>
                <p className="text-emerald-400/70 text-xs mt-1">All courses scheduled with no conflicts.</p>
              </div>
              <Button variant="success" onClick={() => navigate('/timetable')}>View Timetable →</Button>
            </div>
          ) : (
            <div className="bg-red-900/10 border border-red-400/20 rounded-2xl p-6">
              <p className="font-semibold text-red-300 mb-3">{result.errors.length} course{result.errors.length > 1 ? 's' : ''} could not be placed</p>
              <ul className="space-y-1.5 mb-5">
                {result.errors.map((e, i) => (
                  <li key={i} className="text-sm text-red-400 flex items-start gap-2">
                    <span className="mt-0.5 text-red-500">•</span><span>{e}</span>
                  </li>
                ))}
              </ul>
              <div className="flex gap-2">
                <Button variant="danger" size="sm" onClick={handleGenerate}>Retry</Button>
                <Button variant="secondary" size="sm" onClick={() => navigate('/timetable')}>View Partial</Button>
              </div>
            </div>
          )
        )}
      </main>
    </div>
  )
}
