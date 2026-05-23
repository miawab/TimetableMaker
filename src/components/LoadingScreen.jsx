import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ParticleTextEffect } from '@/components/ui/particle-text-effect'
import { LogoCube } from '@/components/ui/icon-3d-hover'

const WORDS = ["TIMETABLE", "MAKER", "SCHEDULE", "NO CLASHES", "EXPORT"]

export default function LoadingScreen({ onNavigate, onEnter }) {
  const [showUI, setShowUI] = useState(false)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setShowUI(true), 800)
    return () => clearTimeout(t)
  }, [])

  function handleEnter() {
    onNavigate?.()          // navigate immediately so the correct page renders behind the fade
    setLeaving(true)
    setTimeout(onEnter, 500)
  }

  return (
    <AnimatePresence>
      {!leaving && (
        <motion.div
          key="splash"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 bg-[#050508] flex flex-col items-center justify-center select-none overflow-hidden"
        >
          {/* Ambient glow */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-indigo-950/60 rounded-full blur-[120px]" />
          </div>

          {/* Logo mark */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: showUI ? 1 : 0, scale: showUI ? 1 : 0.8 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 mb-8"
          >
            <LogoCube size={52} />
          </motion.div>

          {/* Top label */}
          <motion.p
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: showUI ? 1 : 0, y: showUI ? 0 : -8 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 mb-6 font-display text-xs tracking-[0.25em] uppercase text-white/25 font-medium"
          >
            University Timetable Planning
          </motion.p>

          {/* Particle canvas */}
          <div className="relative z-10">
            <ParticleTextEffect words={WORDS} />
          </div>

          {/* Divider + CTA */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: showUI ? 1 : 0, y: showUI ? 0 : 12 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative z-10 mt-10 flex flex-col items-center gap-5"
          >
            <div className="flex items-center gap-4 w-64">
              <div className="flex-1 h-px bg-white/10" />
              <span className="font-display text-white/20 text-[11px] tracking-[0.2em] uppercase">TimetableMaker</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            <button
              onClick={handleEnter}
              className="group relative flex items-center gap-2.5 px-7 py-2.5 rounded-full border border-white/15 text-white/70 text-sm font-medium hover:text-white hover:border-white/40 transition-all duration-300 overflow-hidden"
            >
              <span className="relative z-10">Get Started</span>
              <motion.span
                className="relative z-10 text-base"
                animate={{ x: [0, 3, 0] }}
                transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
              >→</motion.span>
              <span className="absolute inset-0 bg-white/5 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />
            </button>

            <p className="text-white/15 text-[10px] tracking-widest uppercase">
              Right-click canvas to scatter
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
