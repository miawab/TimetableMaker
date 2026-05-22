import { useAppStore } from '../../store/useAppStore'
import Step1Institution from './Step1Institution'
import Step2TimeConfig from './Step2TimeConfig'
import Step3AcademicStructure from './Step3AcademicStructure'
import Step4Rooms from './Step4Rooms'
import Step5Pairings from './Step5Pairings'
import { LogoCube } from '../ui/icon-3d-hover'

const STEPS = ['Institution', 'Time', 'Structure', 'Rooms', 'Pairings']
const COMPONENTS = [Step1Institution, Step2TimeConfig, Step3AcademicStructure, Step4Rooms, Step5Pairings]

export default function WizardShell() {
  const wizardStep = useAppStore((s) => s.wizardStep)
  const setWizardStep = useAppStore((s) => s.setWizardStep)
  const ActiveStep = COMPONENTS[wizardStep]

  return (
    <div className="min-h-screen bg-[#06060a]">
      {/* Header */}
      <header className="bg-[#0a0a12] border-b border-white/[0.07] sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <LogoCube size={22} />
            <span className="font-display font-semibold text-white tracking-tight">TimetableMaker</span>
          </div>

          <nav className="hidden sm:flex items-center gap-0.5">
            {STEPS.map((label, i) => {
              const done = i < wizardStep
              const active = i === wizardStep
              return (
                <button key={i} onClick={() => setWizardStep(i)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                    active   ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' :
                    done     ? 'text-indigo-400/60 hover:text-indigo-400 hover:bg-white/[0.04]' :
                               'text-slate-600 hover:text-slate-400 hover:bg-white/[0.04]'
                  }`}>
                  {done && !active && (
                    <svg className="w-3 h-3 shrink-0" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                  {!done && !active && <span className="w-3 h-3 shrink-0 inline-flex items-center justify-center text-[9px] text-slate-600">{i+1}</span>}
                  {label}
                </button>
              )
            })}
          </nav>

          <span className="sm:hidden text-xs text-slate-600 font-medium">{wizardStep + 1} / {STEPS.length}</span>
        </div>

        {/* Ultra-thin progress line */}
        <div className="h-px bg-white/[0.04]">
          <div className="h-full bg-indigo-500 transition-all duration-500 ease-out"
            style={{ width: `${((wizardStep + 1) / STEPS.length) * 100}%` }} />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <ActiveStep
          onNext={() => setWizardStep(Math.min(wizardStep + 1, STEPS.length - 1))}
          onBack={() => setWizardStep(Math.max(wizardStep - 1, 0))}
          isFirst={wizardStep === 0}
          isLast={wizardStep === STEPS.length - 1}
        />
      </main>
    </div>
  )
}
