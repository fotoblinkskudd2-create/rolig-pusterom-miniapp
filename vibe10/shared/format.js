const nok = new Intl.NumberFormat('nb-NO', { style: 'currency', currency: 'NOK', maximumFractionDigits: 0 })
const nok2 = new Intl.NumberFormat('nb-NO', { style: 'currency', currency: 'NOK', minimumFractionDigits: 2, maximumFractionDigits: 2 })
const dateFmt = new Intl.DateTimeFormat('nb-NO', { day: 'numeric', month: 'short', year: 'numeric' })
const shortFmt = new Intl.DateTimeFormat('nb-NO', { day: 'numeric', month: 'short' })
const timeFmt = new Intl.DateTimeFormat('nb-NO', { hour: '2-digit', minute: '2-digit' })
const monthFmt = new Intl.DateTimeFormat('nb-NO', { month: 'long', year: 'numeric' })

export const kr = (n) => nok.format(Math.round(Number(n) || 0))
export const kr2 = (n) => nok2.format(Number(n) || 0)
export const num = (v) => {
  const n = parseFloat(String(v ?? '').replace(/\s/g, '').replace(',', '.'))
  return Number.isFinite(n) ? n : 0
}
export const fmtDate = (d) => (d ? dateFmt.format(new Date(d)) : '–')
export const fmtShort = (d) => (d ? shortFmt.format(new Date(d)) : '–')
export const fmtTime = (d) => timeFmt.format(new Date(d))
export const fmtMonth = (d) => monthFmt.format(new Date(d))

export const todayISO = () => toISODate(new Date())
export const toISODate = (d) => {
  const x = new Date(d)
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`
}
export const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x }
export const addMonths = (d, n) => {
  const x = new Date(d); const day = x.getDate()
  x.setDate(1); x.setMonth(x.getMonth() + n)
  x.setDate(Math.min(day, new Date(x.getFullYear(), x.getMonth() + 1, 0).getDate()))
  return x
}
// Hele dager fra i dag til dato (negativ = passert). Bruker lokal midnatt.
export const daysUntil = (d) => {
  const a = new Date(); a.setHours(0, 0, 0, 0)
  const b = new Date(d); b.setHours(0, 0, 0, 0)
  return Math.round((b - a) / 86400000)
}
export const relDays = (n) =>
  n === 0 ? 'i dag' : n === 1 ? 'i morgen' : n === -1 ? 'i går' : n > 0 ? `om ${n} dager` : `${-n} dager siden`

export const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`
