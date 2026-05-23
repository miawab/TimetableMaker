import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { temporal } from 'zundo'

const DEFAULT_CONFIG = {
  university: '',
  department: '',
  workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  dayStart: '09:00',
  dayEnd: '17:00',
  slotDuration: 50,
  breakDuration: 10,
  communalBreak: { start: '13:00', end: '14:00', label: 'Lunch / Prayer Break' },
}

const initialState = {
  config: DEFAULT_CONFIG,
  years: [],
  rooms: [],
  teachers: [],
  timetable: null,
  wizardStep: 0,
}

const storeSlice = (set, get) => ({
  ...initialState,

  // Config
  setConfig: (updates) => set((s) => ({ config: { ...s.config, ...updates } })),

  // Wizard navigation
  setWizardStep: (step) => set({ wizardStep: step }),

  // Years / Majors / Courses
  addYear: (year) => set((s) => ({ years: [...s.years, year] })),
  updateYear: (id, updates) =>
    set((s) => ({ years: s.years.map((y) => (y.id === id ? { ...y, ...updates } : y)) })),
  removeYear: (id) => set((s) => ({ years: s.years.filter((y) => y.id !== id) })),

  addMajor: (yearId, major) =>
    set((s) => ({
      years: s.years.map((y) =>
        y.id === yearId ? { ...y, majors: [...(y.majors || []), major] } : y
      ),
    })),
  updateMajor: (yearId, majorId, updates) =>
    set((s) => ({
      years: s.years.map((y) =>
        y.id === yearId
          ? {
              ...y,
              majors: y.majors.map((m) => (m.id === majorId ? { ...m, ...updates } : m)),
            }
          : y
      ),
    })),
  removeMajor: (yearId, majorId) =>
    set((s) => ({
      years: s.years.map((y) =>
        y.id === yearId ? { ...y, majors: y.majors.filter((m) => m.id !== majorId) } : y
      ),
    })),

  addCourse: (yearId, majorId, course) =>
    set((s) => ({
      years: s.years.map((y) =>
        y.id === yearId
          ? {
              ...y,
              majors: y.majors.map((m) =>
                m.id === majorId ? { ...m, courses: [...(m.courses || []), course] } : m
              ),
            }
          : y
      ),
    })),
  updateCourse: (yearId, majorId, courseId, updates) =>
    set((s) => ({
      years: s.years.map((y) =>
        y.id === yearId
          ? {
              ...y,
              majors: y.majors.map((m) =>
                m.id === majorId
                  ? {
                      ...m,
                      courses: m.courses.map((c) =>
                        c.id === courseId ? { ...c, ...updates } : c
                      ),
                    }
                  : m
              ),
            }
          : y
      ),
    })),
  removeCourse: (yearId, majorId, courseId) =>
    set((s) => ({
      years: s.years.map((y) =>
        y.id === yearId
          ? {
              ...y,
              majors: y.majors.map((m) =>
                m.id === majorId
                  ? { ...m, courses: m.courses.filter((c) => c.id !== courseId) }
                  : m
              ),
            }
          : y
      ),
    })),

  // Teachers
  addTeacher: (teacher) => set((s) => ({ teachers: [...s.teachers, teacher] })),
  updateTeacher: (id, updates) =>
    set((s) => ({ teachers: s.teachers.map((t) => (t.id === id ? { ...t, ...updates } : t)) })),
  removeTeacher: (id) => set((s) => ({ teachers: s.teachers.filter((t) => t.id !== id) })),

  // Rooms
  addRoom: (room) => set((s) => ({ rooms: [...s.rooms, room] })),
  updateRoom: (id, updates) =>
    set((s) => ({ rooms: s.rooms.map((r) => (r.id === id ? { ...r, ...updates } : r)) })),
  removeRoom: (id) => set((s) => ({ rooms: s.rooms.filter((r) => r.id !== id) })),

  // Timetable (set by generator or import)
  setTimetable: (timetable) => set({ timetable }),

  // Move a slot (for drag/drop editing)
  moveEntry: ({ dept, major, yearLabel, section, fromDay, toDay, fromTime, toTime, entry }) =>
    set((s) => {
      if (!s.timetable) return s
      const t = JSON.parse(JSON.stringify(s.timetable))
      const src = t[dept]?.[major]?.[yearLabel]?.[section]?.[fromDay]
      if (!src) return s
      const idx = src.findIndex((e) => e.time === fromTime && e.course === entry.course)
      if (idx === -1) return s
      src.splice(idx, 1)
      const dest = t[dept][major][yearLabel][section][toDay]
      dest.push({ ...entry, time: toTime })
      dest.sort((a, b) => a.time.localeCompare(b.time))
      return { timetable: t }
    }),

  updateEntry: ({ dept, major, yearLabel, section, day, time, oldCourse, updates }) =>
    set((s) => {
      if (!s.timetable) return s
      const t = JSON.parse(JSON.stringify(s.timetable))
      const arr = t[dept]?.[major]?.[yearLabel]?.[section]?.[day]
      if (!arr) return s
      const idx = arr.findIndex((e) => e.time === time && e.course === oldCourse)
      if (idx === -1) return s
      arr[idx] = { ...arr[idx], ...updates }
      return { timetable: t }
    }),

  deleteEntry: ({ dept, major, yearLabel, section, day, time, course }) =>
    set((s) => {
      if (!s.timetable) return s
      const t = JSON.parse(JSON.stringify(s.timetable))
      const arr = t[dept]?.[major]?.[yearLabel]?.[section]?.[day]
      if (!arr) return s
      t[dept][major][yearLabel][section][day] = arr.filter(
        (e) => !(e.time === time && e.course === course)
      )
      return { timetable: t }
    }),

  // Full reset
  reset: () => set(initialState),
})

// Wrap with temporal (undo/redo) — only track timetable changes
export const useAppStore = create(
  persist(
    temporal(storeSlice, {
      partialize: (state) => ({ timetable: state.timetable }),
    }),
    { name: 'timetable-maker-storage' }
  )
)

export const useTemporal = () => useAppStore.temporal
