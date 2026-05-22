import { useAppStore } from '../../store/useAppStore'
import { computeSlots } from '../../utils/timeSlots'
import Input from '../common/Input'
import Button from '../common/Button'

const ALL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const DAY_SHORT = { Monday:'Mon', Tuesday:'Tue', Wednesday:'Wed', Thursday:'Thu', Friday:'Fri', Saturday:'Sat' }

export default function Step2TimeConfig({ onNext, onBack }) {
  const config = useAppStore((s) => s.config)
  const setConfig = useAppStore((s) => s.setConfig)

  const slots = (() => { try { return computeSlots(config) } catch { return [] } })()

  function toggleDay(day) {
    const days = config.workingDays.includes(day)
      ? config.workingDays.filter((d) => d !== day)
      : [...config.workingDays, day].sort((a, b) => ALL_DAYS.indexOf(a) - ALL_DAYS.indexOf(b))
    setConfig({ workingDays: days })
  }

  const hasCommunal = !!config.communalBreak

  return (
    <div>
      <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-2">Step 2</p>
      <h2 className="font-display text-3xl font-semibold text-white mb-1">Time Configuration</h2>
      <p className="text-slate-500 text-sm mb-8">Define the shape of the school day. Slot preview updates live.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Settings panel */}
        <div className="bg-[#0e0e18] rounded-2xl border border-white/[0.07] p-6 space-y-6">

          {/* Working days */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Working Days</label>
            <div className="flex flex-wrap gap-2">
              {ALL_DAYS.map((d) => {
                const on = config.workingDays.includes(d)
                return (
                  <button key={d} type="button" onClick={() => toggleDay(d)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all duration-150 ${
                      on
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-white/[0.06] text-slate-400 border-white/10 hover:bg-white/[0.1] hover:border-white/20'
                    }`}>
                    {DAY_SHORT[d]}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Start / End */}
          <div className="grid grid-cols-2 gap-4">
            <Input label="Day Start" type="time" value={config.dayStart} onChange={(e) => setConfig({ dayStart: e.target.value })} />
            <Input label="Day End"   type="time" value={config.dayEnd}   onChange={(e) => setConfig({ dayEnd: e.target.value })} />
          </div>

          {/* Durations */}
          <div className="grid grid-cols-2 gap-4">
            <Input label="Slot Duration (min)" type="number" min={15} max={120} value={config.slotDuration} onChange={(e) => setConfig({ slotDuration: Number(e.target.value) })} />
            <Input label="Break Between (min)"  type="number" min={0}  max={60}  value={config.breakDuration} onChange={(e) => setConfig({ breakDuration: Number(e.target.value) })} />
          </div>

          {/* Communal break */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Communal Break</label>
              <button type="button" onClick={() => setConfig({ communalBreak: hasCommunal ? null : { start:'13:00', end:'14:00', label:'Lunch / Prayer Break' } })}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ${hasCommunal ? 'bg-indigo-600' : 'bg-white/20'}`}>
                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-200 ${hasCommunal ? 'translate-x-4' : 'translate-x-1'}`} />
              </button>
            </div>
            {hasCommunal && (
              <div className="space-y-3 p-4 bg-amber-900/10 rounded-xl border border-amber-400/20">
                <div className="grid grid-cols-2 gap-3">
                  <Input label="From" type="time" value={config.communalBreak.start} onChange={(e) => setConfig({ communalBreak: { ...config.communalBreak, start: e.target.value } })} />
                  <Input label="To"   type="time" value={config.communalBreak.end}   onChange={(e) => setConfig({ communalBreak: { ...config.communalBreak, end: e.target.value } })} />
                </div>
                <Input label="Label" placeholder="Lunch / Prayer Break" value={config.communalBreak.label} onChange={(e) => setConfig({ communalBreak: { ...config.communalBreak, label: e.target.value } })} />
              </div>
            )}
          </div>
        </div>

        {/* Live preview */}
        <div className="bg-[#0e0e18] rounded-2xl border border-white/[0.07] p-6">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">Slot Preview</p>
          {slots.length === 0 ? (
            <p className="text-sm text-slate-600 italic">Adjust settings to see slots.</p>
          ) : (
            <div className="space-y-1.5">
              {slots.map((slot, i) => (
                <div key={slot.id} className="flex items-center gap-3">
                  <span className="text-[11px] text-slate-600 w-5 text-right font-mono">{i + 1}</span>
                  <span className="bg-indigo-500/10 text-indigo-300 text-xs font-mono px-3 py-1.5 rounded-lg border border-indigo-500/20 tracking-wide">
                    {slot.start} – {slot.end}
                  </span>
                </div>
              ))}
              {hasCommunal && (
                <div className="flex items-center gap-3 my-2">
                  <span className="w-5" />
                  <span className="bg-amber-900/10 text-amber-400 text-[11px] px-3 py-1.5 rounded-lg border border-amber-400/20 w-full text-center font-medium">
                    {config.communalBreak.label} · {config.communalBreak.start} – {config.communalBreak.end}
                  </span>
                </div>
              )}
              <p className="text-[11px] text-slate-600 mt-3 pt-3 border-t border-white/[0.04]">
                {slots.length} slots × {config.workingDays.length} days = <span className="text-slate-400 font-medium">{slots.length * config.workingDays.length} slots / week</span>
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex justify-between">
        <Button variant="secondary" onClick={onBack}>← Back</Button>
        <Button onClick={onNext} disabled={slots.length === 0 || config.workingDays.length === 0}>Continue →</Button>
      </div>
    </div>
  )
}
