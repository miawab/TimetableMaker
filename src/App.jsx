import { useState } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useAppStore } from './store/useAppStore'
import WizardShell from './components/wizard/WizardShell'
import GeneratePage from './pages/GeneratePage'
import TimetablePage from './pages/TimetablePage'
import ImportPage from './pages/ImportPage'
import LoadingScreen from './components/LoadingScreen'

export default function App() {
  const [entered, setEntered] = useState(false)
  const setWizardStep = useAppStore((s) => s.setWizardStep)
  const navigate = useNavigate()

  function handleNavigate() {
    setWizardStep(0)
    navigate('/setup', { replace: true })
  }

  return (
    <>
      <AnimatePresence>
        {!entered && (
          <LoadingScreen
            onNavigate={handleNavigate}
            onEnter={() => setEntered(true)}
          />
        )}
      </AnimatePresence>

      <Routes>
        <Route path="/" element={<Navigate to="/setup" replace />} />
        <Route path="/setup" element={<WizardShell />} />
        <Route path="/generate" element={<GeneratePage />} />
        <Route path="/timetable" element={<TimetablePage />} />
        <Route path="/import" element={<ImportPage />} />
      </Routes>
    </>
  )
}
