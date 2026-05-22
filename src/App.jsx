import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import WizardShell from './components/wizard/WizardShell'
import GeneratePage from './pages/GeneratePage'
import TimetablePage from './pages/TimetablePage'
import ImportPage from './pages/ImportPage'
import LoadingScreen from './components/LoadingScreen'

export default function App() {
  const [entered, setEntered] = useState(false)

  return (
    <>
      <AnimatePresence>
        {!entered && <LoadingScreen onEnter={() => setEntered(true)} />}
      </AnimatePresence>

      {entered && (
        <Routes>
          <Route path="/" element={<Navigate to="/setup" replace />} />
          <Route path="/setup" element={<WizardShell />} />
          <Route path="/generate" element={<GeneratePage />} />
          <Route path="/timetable" element={<TimetablePage />} />
          <Route path="/import" element={<ImportPage />} />
        </Routes>
      )}
    </>
  )
}
