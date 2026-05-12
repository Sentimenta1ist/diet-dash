import {
  Document,
  Packer,
  Table,
  TableRow,
  TableCell,
  Paragraph,
  TextRun,
  AlignmentType,
  ShadingType,
  WidthType,
  HeightRule,
  PageOrientation,
} from 'docx'
import ExcelJS from 'exceljs'
import { RationDto, MealWithNameDto } from '../types.js'

type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6

function uaTransform(dow: DayOfWeek): string {
  const map: Record<DayOfWeek, string> = {
    0: 'Неділя',
    1: 'Понеділок',
    2: 'Вівторок',
    3: 'Середа',
    4: 'Четвер',
    5: 'Пʼятниця',
    6: 'Субота',
  }
  return map[dow]
}

function enTransform(dow: DayOfWeek): string {
  const map: Record<DayOfWeek, string> = {
    0: 'Sun',
    1: 'Mon',
    2: 'Tue',
    3: 'Wed',
    4: 'Thu',
    5: 'Fri',
    6: 'Sat',
  }
  return map[dow]
}

function formatDdMm(dateStr: string): string {
  const parts = dateStr.split('-')
  return `${parts[2]}/${parts[1]}`
}

function getDow(dateStr: string): DayOfWeek {
  return new Date(dateStr).getDay() as DayOfWeek
}

function sortMeals(meals: MealWithNameDto[]): MealWithNameDto[] {
  return [...meals].sort((a, b) => a.time.localeCompare(b.time))
}

// ─── Word (.docx) export ──────────────────────────────────────────────────────
//
// Replicates ExportService.exportDoc from Java.
// Table widths in DXA (twentieths of a point). A4 portrait with 0.5" margins
// gives 11906 - 2×720 = 10466 DXA usable; table uses 10000 DXA.
// docx v8 requires columnWidths on the Table to emit <w:tblGrid> — without it
// Word ignores per-cell widths and squishes everything to content width.
// Row heights: header + data = 400 twips; spacer = 200 twips.

export async function exportDoc(
  lang: string,
  rationsByDate: Map<string, RationDto | null>,
  dates: string[],
): Promise<Buffer> {
  const timeHeader = lang === 'uk' ? 'Час' : 'Time'
  const nameHeader = lang === 'uk' ? '    Назва продукту' : '    Product name'
  const sizeHeader = lang === 'uk' ? 'Порція(г)' : 'Portion(g)'

  const rows: TableRow[] = []

  // Header row
  rows.push(
    new TableRow({
      height: { value: 400, rule: HeightRule.EXACT },
      children: [
        makeHeaderCell(timeHeader, 'afcefa', 1000),
        makeHeaderCell(nameHeader, 'ffd194', 7500),
        makeHeaderCell(sizeHeader, 'b2f7c5', 1500),
      ],
    }),
  )

  for (const dateStr of dates) {
    const ration = rationsByDate.get(dateStr)
    if (!ration || ration.meals.length === 0) continue

    const dow = getDow(dateStr)
    const weekday = lang === 'uk' ? uaTransform(dow) : enTransform(dow)
    const label = `${weekday} (${formatDdMm(dateStr)})`

    // Date header row merged across all 3 columns
    rows.push(makeMergedRow(label, 'c2c2c2', 400))

    const sorted = sortMeals(ration.meals)
    for (let i = 0; i < sorted.length; i++) {
      const meal = sorted[i]

      // Insert spacer between different time slots
      if (i > 0 && sorted[i - 1].time !== meal.time) {
        rows.push(makeMergedRow('', null, 200))
      }

      rows.push(
        new TableRow({
          height: { value: 400, rule: HeightRule.EXACT },
          children: [
            makeDataCell(meal.time, AlignmentType.CENTER, 1000),
            makeDataCell(` ${meal.productName}`, AlignmentType.LEFT, 7500),
            makeDataCell(String(meal.grams), AlignmentType.CENTER, 1500),
          ],
        }),
      )
    }
  }

  const table = new Table({
    width: { size: 10000, type: WidthType.DXA },
    columnWidths: [1000, 7500, 1500], // required for <w:tblGrid> so Word respects cell widths
    rows,
  })

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          size: { width: 11906, height: 16838, orientation: PageOrientation.PORTRAIT },
          margin: { top: 720, right: 720, bottom: 720, left: 720 }, // 0.5 inch = 720 DXA
        },
      },
      children: [table],
    }],
  })

  return Packer.toBuffer(doc)
}

function makeHeaderCell(text: string, bgHex: string, widthDxa: number): TableCell {
  return new TableCell({
    width: { size: widthDxa, type: WidthType.DXA },
    shading: { type: ShadingType.SOLID, color: bgHex, fill: bgHex },
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text,
            bold: true,
            color: '000000',
            size: 30, // 15pt = 30 half-points
          }),
        ],
      }),
    ],
  })
}

function makeDataCell(text: string, align: (typeof AlignmentType)[keyof typeof AlignmentType], widthDxa: number): TableCell {
  return new TableCell({
    width: { size: widthDxa, type: WidthType.DXA },
    children: [
      new Paragraph({
        alignment: align,
        children: [new TextRun({ text, size: 30 })],
      }),
    ],
  })
}

function makeMergedRow(text: string, bgHex: string | null, heightTwips: number): TableRow {
  const para = new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text, size: 30, italics: true })],
  })

  const cell = bgHex
    ? new TableCell({
        columnSpan: 3,
        shading: { type: ShadingType.SOLID, color: bgHex, fill: bgHex },
        children: [para],
      })
    : new TableCell({ columnSpan: 3, children: [para] })

  return new TableRow({
    height: { value: heightTwips, rule: HeightRule.EXACT },
    children: [cell],
  })
}

// ─── Excel (.xlsx) export ─────────────────────────────────────────────────────
//
// Replicates ExportService.exportXlsx from Java.
// Header always uses Ukrainian (matching original — Excel export is UA-only).
// Colour mapping from IndexedColors:
//   PALE_BLUE         → ccffff
//   TAN               → ffcc99
//   LIGHT_GREEN       → ccffcc
//   GREY_25_PERCENT   → c0c0c0
//   GREY_80_PERCENT font colour → 333333

export async function exportXlsx(
  rationsByDate: Map<string, RationDto | null>,
  dates: string[],
): Promise<Buffer> {
  const wb = new ExcelJS.Workbook()
  const ws = wb.addWorksheet('Diet plan')

  ws.getColumn(1).width = 12
  ws.getColumn(2).width = 40
  ws.getColumn(3).width = 12

  const solidFill = (hex: string): ExcelJS.Fill => ({
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: `FF${hex}` },
  })

  const thinBorder: Partial<ExcelJS.Border> = { style: 'thin', color: { argb: 'FF000000' } }
  const borders = {
    top: thinBorder,
    left: thinBorder,
    bottom: thinBorder,
    right: thinBorder,
  } as ExcelJS.Borders // cast — ExcelJS.Borders.diagonal is optional at runtime

  const baseFont: Partial<ExcelJS.Font> = {
    name: 'Arial',
    size: 16,
    color: { argb: 'FF333333' },
  }

  // Header row
  const headerRow = ws.addRow(['Час', 'Назва продукту', 'Порція(г)'])
  headerRow.height = 22
  headerRow.getCell(1).fill = solidFill('ccffff')
  headerRow.getCell(2).fill = solidFill('ffcc99')
  headerRow.getCell(3).fill = solidFill('ccffcc')
  headerRow.eachCell(cell => {
    cell.font = { ...baseFont, bold: true }
    cell.alignment = { horizontal: 'center' }
    cell.border = borders
  })

  for (const dateStr of dates) {
    const dow = getDow(dateStr)
    const label = `${uaTransform(dow)} (${formatDdMm(dateStr)})`

    const dateRow = ws.addRow([label, '', ''])
    const rowNum = dateRow.number
    ws.mergeCells(rowNum, 1, rowNum, 3)
    ;[1, 2, 3].forEach(col => {
      const cell = dateRow.getCell(col)
      cell.fill = solidFill('c0c0c0')
      cell.font = baseFont
      cell.alignment = { horizontal: 'center' }
    })

    const ration = rationsByDate.get(dateStr)
    if (!ration) continue

    const sorted = sortMeals(ration.meals)
    for (let i = 0; i < sorted.length; i++) {
      const meal = sorted[i]

      if (i > 0 && sorted[i - 1].time !== meal.time) {
        const spacer = ws.addRow([])
        spacer.height = 15
      }

      const dataRow = ws.addRow([`${meal.time} `, ` ${meal.productName}`, meal.grams])
      dataRow.height = 22
      dataRow.getCell(1).alignment = { horizontal: 'right' }
      dataRow.getCell(2).alignment = { horizontal: 'left' }
      dataRow.getCell(3).alignment = { horizontal: 'left' }
      dataRow.eachCell(cell => {
        cell.font = baseFont
        cell.fill = solidFill('ffffff')
        cell.border = borders
      })
    }
  }

  const buf = await wb.xlsx.writeBuffer()
  return Buffer.from(buf)
}
