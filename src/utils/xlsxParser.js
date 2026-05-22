import * as XLSX from 'xlsx'

// Replicates parser.py logic in JS
// Returns { timetable, config (partial) }
export function parseXlsx(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const wb = XLSX.read(data, { type: 'array', cellText: true, cellDates: false })

        const yearMap = {
          '2K25': 'Year 1 – Freshman',
          '2K24': 'Year 2 – Sophomore',
          '2K23': 'Year 3 – Junior',
          '2K22': 'Year 4 – Senior',
        }

        const dayColumns = { Monday: 2, Tuesday: 3, Wednesday: 4, Thursday: 5, Friday: 7 }
        const timetable = {}

        for (const sheetName of wb.SheetNames) {
          const ws = wb.Sheets[sheetName]
          const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })

          for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
            const row = rows[rowIdx]
            const first = String(row[0] || '').trim()
            if (first !== 'TIME / DAYS') continue

            let headerText = ''
            if (rowIdx > 0) headerText += String(rows[rowIdx - 1][0] || '')
            if (rowIdx > 1) headerText += String(rows[rowIdx - 2][0] || '')

            const match = headerText.match(/(2K2[2-5])-([A-Z]+)-?\d*([A-Z])/i)
            if (!match) continue

            let [, intake, major, section] = match
            intake = intake.toUpperCase()
            major = major.toUpperCase()
            section = section.toUpperCase()
            const yearLabel = yearMap[intake] || intake

            if (!timetable[major]) timetable[major] = {}
            if (!timetable[major][yearLabel]) timetable[major][yearLabel] = {}
            if (!timetable[major][yearLabel][section]) {
              timetable[major][yearLabel][section] = {
                Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [],
              }
            }

            for (let offset = 1; offset < 40; offset++) {
              if (rowIdx + offset >= rows.length) break
              const r = rows[rowIdx + offset]
              const timeVal = String(r[0] || '').trim()
              if (timeVal.includes('Code') || timeVal === 'TIME / DAYS') break
              if (!/^\d{4}-\d{4}/.test(timeVal)) continue

              for (const [day, col] of Object.entries(dayColumns)) {
                const cellVal = String(r[col] || '').trim()
                if (!cellVal) continue
                parseCell(cellVal, timeVal).forEach((entry) => {
                  timetable[major][yearLabel][section][day].push(entry)
                })
              }
            }
          }
        }

        // Wrap under department key
        resolve({ timetable: { Imported: timetable } })
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}

function parseCell(text, time) {
  const entries = []
  if (!text || /Seminar|Library|Lunch|Prayer|Timings/i.test(text)) return entries

  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)
  let i = 0
  while (i < lines.length) {
    let course = lines[i].replace(/\/$/, '').trim()
    let room = null

    if (i + 1 < lines.length && /^\([^)]+\)$/.test(lines[i + 1])) {
      room = lines[i + 1].slice(1, -1).trim()
      i += 2
    } else {
      const m = course.match(/\(([^)]+)\)\s*$/)
      if (m) { room = m[1].trim(); course = course.slice(0, m.index).trim() }
      i++
    }
    if (course) entries.push({ time, course, room })
  }
  return entries
}

export async function exportXlsx(timetable, config) {
  const ExcelJS = (await import('exceljs')).default
  const wb = new ExcelJS.Workbook()
  wb.creator = 'TimetableMaker'

  const dept = Object.keys(timetable)[0]
  const deptData = timetable[dept]
  const days = config.workingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

  // Colours
  const C = {
    indigoDark:  'FF312E81',
    indigoMid:   'FF4338CA',
    indigoLight: 'FFEEF2FF',
    indigoText:  'FF3730A3',
    timeCol:     'FFF8FAFC',
    timeBorder:  'FFE2E8F0',
    rowAlt:      'FFFAFAFA',
    rowWhite:    'FFFFFFFF',
    breakBg:     'FFFEF3C7',
    breakText:   'FF92400E',
    border:      'FFD1D5DB',
    sectionBg:   'FF1E1B4B',
  }

  // Collect all unique sorted times across the whole timetable
  const allTimes = new Set()
  for (const major of Object.values(deptData)) {
    for (const yearObj of Object.values(major)) {
      for (const sectionObj of Object.values(yearObj)) {
        for (const dayArr of Object.values(sectionObj)) {
          dayArr.forEach((e) => allTimes.add(e.time))
        }
      }
    }
  }
  const sortedTimes = [...allTimes].sort()

  function borderAll(color = C.border) {
    const s = { style: 'thin', color: { argb: color } }
    return { top: s, left: s, bottom: s, right: s }
  }

  function applyFill(cell, argb) {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb } }
  }

  function setFont(cell, opts = {}) {
    cell.font = { name: 'Calibri', size: opts.size || 10, bold: !!opts.bold, color: opts.color ? { argb: opts.color } : undefined, italic: !!opts.italic }
  }

  for (const [majorName, majorData] of Object.entries(deptData)) {
    const ws = wb.addWorksheet(majorName.slice(0, 31))

    // Column widths: col 1 = time, cols 2+ = one per day
    ws.getColumn(1).width = 14
    days.forEach((_, i) => { ws.getColumn(i + 2).width = 24 })

    const totalCols = days.length + 1

    for (const [yearLabel, yearData] of Object.entries(majorData)) {
      const yearMatch = yearLabel.match(/(2K\d+)/i)
      const intakeCode = yearMatch ? yearMatch[1].toUpperCase() : yearLabel

      for (const [section, sectionData] of Object.entries(yearData)) {
        // ── Section title row ──────────────────────────────────────────────
        const titleRow = ws.addRow([`${intakeCode}-${majorName}-${section}  ·  ${config.university || ''}  ·  ${config.department || ''}`])
        ws.mergeCells(titleRow.number, 1, titleRow.number, totalCols)
        const titleCell = titleRow.getCell(1)
        applyFill(titleCell, C.sectionBg)
        setFont(titleCell, { size: 13, bold: true, color: 'FFFFFFFF' })
        titleCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }
        titleRow.height = 30

        // ── Day header row ─────────────────────────────────────────────────
        const headerRow = ws.addRow(['TIME / DAYS', ...days])
        headerRow.height = 22
        headerRow.eachCell((cell, col) => {
          applyFill(cell, col === 1 ? C.timeBorder : C.indigoLight)
          setFont(cell, { bold: true, color: col === 1 ? 'FF6B7280' : C.indigoText })
          cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: false }
          cell.border = borderAll()
        })

        // ── Time slot rows ─────────────────────────────────────────────────
        let prevTimeEnd = null
        let rowIndex = 0

        for (const time of sortedTimes) {
          // Insert communal break row when there's a visible gap
          if (config.communalBreak && prevTimeEnd) {
            const breakStart = config.communalBreak.start.replace(':', '')
            const breakEnd   = config.communalBreak.end.replace(':', '')
            const slotStart  = time.split('-')[0].replace(':', '')
            if (prevTimeEnd <= breakStart && slotStart >= breakEnd) {
              const breakRow = ws.addRow([`${config.communalBreak.label}  (${config.communalBreak.start} – ${config.communalBreak.end})`, ...days.map(() => '')])
              ws.mergeCells(breakRow.number, 1, breakRow.number, totalCols)
              const bc = breakRow.getCell(1)
              applyFill(bc, C.breakBg)
              setFont(bc, { bold: true, italic: true, color: C.breakText, size: 9 })
              bc.alignment = { vertical: 'middle', horizontal: 'center' }
              bc.border = borderAll('FFFCD34D')
              breakRow.height = 16
            }
          }
          prevTimeEnd = time.split('-')[1]?.replace(':', '') || null

          const isAlt = rowIndex % 2 === 1
          rowIndex++

          // Build row values
          const values = [time]
          let maxLines = 1
          for (const day of days) {
            const entries = (sectionData[day] || []).filter((e) => e.time === time)
            if (!entries.length) { values.push(''); continue }
            const text = entries.map((e) => e.room ? `${e.course}\n(${e.room})` : e.course).join('\n─────\n')
            values.push(text)
            maxLines = Math.max(maxLines, entries.length * 2)
          }

          const dataRow = ws.addRow(values)
          dataRow.height = Math.max(30, maxLines * 14)

          dataRow.eachCell({ includeEmpty: true }, (cell, col) => {
            cell.border = borderAll()
            cell.alignment = { vertical: 'top', horizontal: col === 1 ? 'center' : 'left', wrapText: true, indent: col === 1 ? 0 : 1 }

            if (col === 1) {
              applyFill(cell, C.timeCol)
              setFont(cell, { bold: true, size: 9, color: 'FF4B5563' })
            } else {
              applyFill(cell, isAlt ? C.rowAlt : C.rowWhite)
              if (cell.value) {
                // Bold first line (course name), lighter second line (room) via rich text
                const lines = String(cell.value).split('\n')
                cell.value = {
                  richText: lines.map((line, i) => ({
                    font: {
                      name: 'Calibri',
                      size: 9,
                      bold: !line.startsWith('(') && line !== '─────',
                      italic: line.startsWith('('),
                      color: { argb: line === '─────' ? 'FFD1D5DB' : line.startsWith('(') ? 'FF6B7280' : 'FF1F2937' },
                    },
                    text: line + (i < lines.length - 1 ? '\n' : ''),
                  })),
                }
              }
            }
          })
        }

        // 2 blank spacer rows between sections
        ws.addRow([])
        ws.addRow([])
      }
    }
  }

  // Save as blob and trigger download
  const buffer = await wb.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `timetable_${config.department || 'export'}.xlsx`
  a.click()
  URL.revokeObjectURL(url)
}
