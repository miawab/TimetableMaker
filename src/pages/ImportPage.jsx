import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { parseXlsx } from '../utils/xlsxParser'
import Button from '../components/common/Button'
import { LogoCube } from '../components/ui/icon-3d-hover'

export default function ImportPage() {
  const navigate = useNavigate()
  const setTimetable = useAppStore((s) => s.setTimetable)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const fileRef = useRef()

  async function handleFile(file) {
    if (!file) return
    setError('')
    setLoading(true)
    try {
      if (file.name.endsWith('.json')) {
        const text = await file.text()
        setTimetable(JSON.parse(text))
        navigate('/timetable')
      } else if (file.name.match(/\.xlsx?$/i)) {
        const { timetable } = await parseXlsx(file)
        setTimetable(timetable)
        navigate('/timetable')
      } else {
        setError('Unsupported file type. Upload a .json or .xlsx file.')
      }
    } catch (e) {
      setError(`Failed to parse file: ${e.message}`)
    }
    setLoading(false)
  }

  function onDrop(e) {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }

  return (
    <div className="min-h-screen bg-[#06060a]">
      <header className="bg-[#0a0a12] border-b border-white/[0.07] sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <LogoCube size={22} />
            <span className="font-display font-semibold text-white tracking-tight">TimetableMaker</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/setup')}>Setup</Button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-14">
        <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-2">Import</p>
        <h2 className="font-display text-3xl font-semibold text-white mb-1">Load Existing Timetable</h2>
        <p className="text-slate-500 text-sm mb-10">
          A <code className="text-slate-400 bg-white/[0.06] px-1 py-0.5 rounded text-xs">.json</code> export from this app restores everything — structure, rooms, teachers, and any manual edits. An <code className="text-slate-400 bg-white/[0.06] px-1 py-0.5 rounded text-xs">.xlsx</code> loads timetable data only; you'd need to re-enter rooms and structure if you want to regenerate.
        </p>

        <div
          className={`border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all duration-200 ${
            dragging
              ? 'border-indigo-400/60 bg-indigo-500/5'
              : 'border-white/10 hover:border-white/20 hover:bg-white/[0.02]'
          }`}
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
        >
          <input ref={fileRef} type="file" accept=".json,.xlsx,.xls" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
          <div className="text-4xl mb-4 opacity-40">{loading ? '⏳' : '↑'}</div>
          <p className="text-slate-300 font-medium text-sm mb-1">
            {loading ? 'Parsing file…' : 'Drop file here or click to browse'}
          </p>
          <p className="text-slate-500 text-xs">.json · .xlsx · .xls</p>
        </div>

        {error && (
          <div className="mt-4 bg-red-900/10 border border-red-400/20 rounded-xl p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="mt-8 flex items-center gap-4">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-xs text-slate-600">or</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <div className="mt-6 text-center">
          <Button variant="ghost" onClick={() => navigate('/setup')}>
            Start fresh from Setup wizard
          </Button>
        </div>
      </main>
    </div>
  )
}
