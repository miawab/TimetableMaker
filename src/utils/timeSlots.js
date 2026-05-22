// Compute time slots from Config
export function computeSlots(config) {
  const { dayStart, dayEnd, slotDuration, breakDuration, communalBreak } = config

  const slots = []
  let current = parseMinutes(dayStart)
  const end = parseMinutes(dayEnd)
  const breakStart = communalBreak ? parseMinutes(communalBreak.start) : null
  const breakEnd = communalBreak ? parseMinutes(communalBreak.end) : null

  while (current + slotDuration <= end) {
    // Skip communal break window
    if (breakStart !== null && current >= breakStart && current < breakEnd) {
      current = breakEnd
      continue
    }

    const slotEnd = current + slotDuration

    // Don't start a slot that runs into the communal break
    if (breakStart !== null && current < breakStart && slotEnd > breakStart) {
      current = breakEnd
      continue
    }

    slots.push({
      id: `${fmt(current)}-${fmt(slotEnd)}`,
      start: fmt(current),
      end: fmt(slotEnd),
      startMin: current,
      endMin: slotEnd,
    })

    current = slotEnd + breakDuration
  }

  return slots
}

function parseMinutes(timeStr) {
  const [h, m] = timeStr.split(':').map(Number)
  return h * 60 + m
}

function fmt(minutes) {
  const h = Math.floor(minutes / 60).toString().padStart(2, '0')
  const m = (minutes % 60).toString().padStart(2, '0')
  return `${h}:${m}`
}

export function formatSlotId(id) {
  // "09:00-09:50" stays as-is
  return id
}
