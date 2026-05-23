import { useAppStore } from '../../store/useAppStore'
import Step1Institution from './Step1Institution'
import Step2TimeConfig from './Step2TimeConfig'
import Step3AcademicStructure from './Step3AcademicStructure'
import Step4Teachers from './Step4Teachers'
import Step4Rooms from './Step4Rooms'
import Step5Pairings from './Step5Pairings'
import { LogoCube } from '../ui/icon-3d-hover'

const STEPS = ['Institution', 'Time', 'Structure', 'Teachers', 'Rooms', 'Pairings']
const COMPONENTS = [Step1Institution, Step2TimeConfig, Step3AcademicStructure, Step4Teachers, Step4Rooms, Step5Pairings]

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

          <div className="flex items-center gap-3">
            <span className="sm:hidden text-xs text-slate-600 font-medium">{wizardStep + 1} / {STEPS.length}</span>
            <a
              href="https://www.linkedin.com/in/ibrahim-awab-743a2a325/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Ibrahim Awab on LinkedIn"
              className="text-slate-600 hover:text-[#0A66C2] transition-colors duration-200"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
          </div>
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
