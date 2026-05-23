import { useAppStore } from '../../store/useAppStore'
import Input from '../common/Input'
import Button from '../common/Button'

export default function Step1Institution({ onNext }) {
  const config = useAppStore((s) => s.config)
  const setConfig = useAppStore((s) => s.setConfig)

  return (
    <div className="max-w-md">
      <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-2">Step 1</p>
      <h2 className="font-display text-3xl font-semibold text-white mb-1">Institution</h2>
      <p className="text-slate-500 text-sm mb-8">Purely cosmetic — these don't affect scheduling at all. You can change them any time, even after generating.</p>

      <div className="bg-[#0e0e18] rounded-2xl border border-white/[0.07] p-6 space-y-5">
        <Input
          label="University Name"
          placeholder="e.g. NUST"
          value={config.university}
          onChange={(e) => setConfig({ university: e.target.value })}
        />
        <Input
          label="Department / Faculty"
          placeholder="e.g. SEECS"
          value={config.department}
          onChange={(e) => setConfig({ department: e.target.value })}
        />
      </div>

      <div className="mt-6 flex justify-end">
        <Button onClick={onNext} disabled={!config.university || !config.department}>
          Continue →
        </Button>
      </div>
    </div>
  )
}
