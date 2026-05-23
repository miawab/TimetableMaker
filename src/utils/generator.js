import { computeSlots } from './timeSlots'

export function generateTimetable(config, years, rooms, teachers = []) {
  const slots = computeSlots(config)
  const days = config.workingDays
  const dept = config.department || 'DEPT'

  // Build initial empty timetable structure
  const timetable = { [dept]: {} }

  // Map of (day, slotId, roomId) -> course string, for room clash detection
  const roomOccupancy = {} // key: `${day}|${slotId}|${roomId}`
  // Map of (day, slotId, dept, major, yearLabel, section) -> true, for section clash
  const sectionOccupancy = {} // key: `${day}|${slotId}|${major}|${yearLabel}|${section}`
  // Map of (day, slotId, teacherId) -> true, for teacher clash detection
  const teacherOccupancy = {} // key: `${day}|${slotId}|${teacherId}`

  // Quick lookup: teacherId -> teacher name
  const teacherMap = {}
  for (const t of teachers) { teacherMap[t.id] = t.name }

  // Pre-build empty structure
  for (const year of years) {
    const yearLabel = year.label
    for (const major of year.majors || []) {
      if (!timetable[dept][major.name]) timetable[dept][major.name] = {}
      if (!timetable[dept][major.name][yearLabel]) timetable[dept][major.name][yearLabel] = {}
      for (const section of major.sections || []) {
        timetable[dept][major.name][yearLabel][section] = {}
        for (const day of days) {
          timetable[dept][major.name][yearLabel][section][day] = []
        }
      }
    }
  }

  // Build scheduling units: { course, yearLabel, major, section, type, slotsNeeded, labSlots, groups, allowedRooms, roomConstraint }
  const units = []
  for (const year of years) {
    const yearLabel = year.label
    for (const major of year.majors || []) {
      for (const course of major.courses || []) {
        const groups = course.groups?.length ? course.groups : [null]
        for (const section of major.sections || []) {
          for (const group of groups) {
            if (course.type === 'lab') {
              units.push({
                course: course.name + (group ? ` (${group})` : ''),
                yearLabel,
                majorName: major.name,
                section,
                type: 'lab',
                slotsNeeded: course.labSlots || 2,
                labSlots: course.labSlots || 2,
                allowedRooms: course.allowedRooms || [],
                roomConstraint: course.roomConstraint || 'free',
                creditHours: course.creditHours,
                teacherId: course.teacherId || null,
              })
            } else {
              // One unit per credit hour, placed on separate days
              for (let i = 0; i < (course.creditHours || 3); i++) {
                units.push({
                  course: course.name + (group ? ` (${group})` : ''),
                  yearLabel,
                  majorName: major.name,
                  section,
                  type: 'lecture',
                  slotsNeeded: 1,
                  allowedRooms: course.allowedRooms || [],
                  roomConstraint: course.roomConstraint || 'free',
                  creditHours: course.creditHours,
                  unitIndex: i,
                  teacherId: course.teacherId || null,
                })
              }
            }
          }
        }
      }
    }
  }

  // Sort: labs first (more constrained), then by fewest allowed rooms
  units.sort((a, b) => {
    if (a.type === 'lab' && b.type !== 'lab') return -1
    if (b.type === 'lab' && a.type !== 'lab') return 1
    return (a.allowedRooms.length || 99) - (b.allowedRooms.length || 99)
  })

  const classroomTypes = ['classroom', 'lecture_hall']
  const labTypes = ['lab']

  function getEligibleRooms(unit) {
    if (unit.allowedRooms?.length) {
      return rooms.filter((r) => unit.allowedRooms.includes(r.id))
    }
    const compatTypes = unit.type === 'lab' ? labTypes : classroomTypes
    return rooms.filter((r) => compatTypes.includes(r.type))
  }

  function occupyRoom(day, slotId, roomId) {
    roomOccupancy[`${day}|${slotId}|${roomId}`] = true
  }
  function isRoomFree(day, slotId, roomId) {
    return !roomOccupancy[`${day}|${slotId}|${roomId}`]
  }
  function occupySection(day, slotId, majorName, yearLabel, section) {
    sectionOccupancy[`${day}|${slotId}|${majorName}|${yearLabel}|${section}`] = true
  }
  function isSectionFree(day, slotId, majorName, yearLabel, section) {
    return !sectionOccupancy[`${day}|${slotId}|${majorName}|${yearLabel}|${section}`]
  }
  function occupyTeacher(day, slotId, teacherId) {
    if (!teacherId) return
    teacherOccupancy[`${day}|${slotId}|${teacherId}`] = true
  }
  function isTeacherFree(day, slotId, teacherId) {
    if (!teacherId) return true
    return !teacherOccupancy[`${day}|${slotId}|${teacherId}`]
  }

  // Track which days each lecture course-section has been placed on (spread constraint)
  const lectureDaysUsed = {} // key: `${course}|${majorName}|${yearLabel}|${section}`

  const errors = []

  for (const unit of units) {
    const eligibleRooms = getEligibleRooms(unit)
    let placed = false

    if (unit.type === 'lab') {
      outer: for (const day of shuffle([...days])) {
        // Find consecutive slot blocks of required length
        for (let si = 0; si <= slots.length - unit.labSlots; si++) {
          // Check all consecutive slots are in same day window (no gap between them)
          const block = slots.slice(si, si + unit.labSlots)
          // Ensure consecutive (each slot.startMin === prev slot.endMin + 0 practically — slots are pre-computed, just check no communal break in middle)
          let contiguous = true
          for (let b = 0; b < block.length - 1; b++) {
            if (block[b + 1].startMin !== block[b].endMin + config.breakDuration) {
              contiguous = false
              break
            }
          }
          if (!contiguous) continue

          for (const room of shuffle([...eligibleRooms])) {
            let canPlace = true
            for (const slot of block) {
              if (!isRoomFree(day, slot.id, room.id)) { canPlace = false; break }
              if (!isSectionFree(day, slot.id, unit.majorName, unit.yearLabel, unit.section)) { canPlace = false; break }
              if (!isTeacherFree(day, slot.id, unit.teacherId)) { canPlace = false; break }
            }
            if (canPlace) {
              for (const slot of block) {
                occupyRoom(day, slot.id, room.id)
                occupySection(day, slot.id, unit.majorName, unit.yearLabel, unit.section)
                occupyTeacher(day, slot.id, unit.teacherId)
                timetable[dept][unit.majorName][unit.yearLabel][unit.section][day].push({
                  time: slot.id,
                  course: unit.course,
                  room: room.name,
                  teacher: unit.teacherId ? teacherMap[unit.teacherId] : null,
                })
              }
              placed = true
              break outer
            }
          }
        }
      }
    } else {
      // Lecture: prefer a day not yet used for this course
      const usedKey = `${unit.course}|${unit.majorName}|${unit.yearLabel}|${unit.section}`
      const usedDays = lectureDaysUsed[usedKey] || new Set()
      const preferredDays = [...days].sort((a, b) => {
        const aUsed = usedDays.has(a) ? 1 : 0
        const bUsed = usedDays.has(b) ? 1 : 0
        return aUsed - bUsed
      })

      for (const day of preferredDays) {
        for (const slot of slots) {
          if (!isSectionFree(day, slot.id, unit.majorName, unit.yearLabel, unit.section)) continue
          if (!isTeacherFree(day, slot.id, unit.teacherId)) continue
          for (const room of shuffle([...eligibleRooms])) {
            if (isRoomFree(day, slot.id, room.id)) {
              occupyRoom(day, slot.id, room.id)
              occupySection(day, slot.id, unit.majorName, unit.yearLabel, unit.section)
              occupyTeacher(day, slot.id, unit.teacherId)
              timetable[dept][unit.majorName][unit.yearLabel][unit.section][day].push({
                time: slot.id,
                course: unit.course,
                room: room.name,
                teacher: unit.teacherId ? teacherMap[unit.teacherId] : null,
              })
              if (!lectureDaysUsed[usedKey]) lectureDaysUsed[usedKey] = new Set()
              lectureDaysUsed[usedKey].add(day)
              placed = true
              break
            }
          }
          if (placed) break
        }
        if (placed) break
      }
    }

    if (!placed) {
      errors.push(`Could not place: ${unit.course} (${unit.majorName} ${unit.yearLabel} ${unit.section})`)
    }
  }

  // Sort each day's entries by time
  for (const major of Object.values(timetable[dept])) {
    for (const yearObj of Object.values(major)) {
      for (const sectionObj of Object.values(yearObj)) {
        for (const day of Object.keys(sectionObj)) {
          sectionObj[day].sort((a, b) => a.time.localeCompare(b.time))
        }
      }
    }
  }

  return { timetable, errors }
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}
