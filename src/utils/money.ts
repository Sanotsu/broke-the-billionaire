export function formatFull(n: number): string {
  return n.toLocaleString('en-US')
}

export function formatAbbrev(n: number): string {
  const abs = Math.abs(n)
  if (abs >= 1e12) return `${trim(n / 1e12)}T`
  if (abs >= 1e9) return `${trim(n / 1e9)}B`
  if (abs >= 1e6) return `${trim(n / 1e6)}M`
  if (abs >= 1e3) return `${trim(n / 1e3)}K`
  return `${n}`
}

function trim(v: number): string {
  const s = v >= 100 ? v.toFixed(0) : v >= 10 ? v.toFixed(1) : v.toFixed(2)
  return s.replace(/\.0+$/, '').replace(/(\.\d*[1-9])0+$/, '$1')
}

export function formatMoney(n: number, mode: 'full' | 'abbrev' = 'full'): string {
  return mode === 'abbrev' ? `$${formatAbbrev(n)}` : `$${formatFull(n)}`
}

export function logProgress(remaining: number, initial: number): number {
  if (remaining <= 0) return 1
  if (initial <= 1) return 1 - remaining / initial
  const spent = Math.log10(initial + 1) - Math.log10(remaining + 1)
  const total = Math.log10(initial + 1)
  return Math.min(1, Math.max(0, spent / total))
}

const AVG_ANNUAL_INCOME = 60_000
const MS_PER_YEAR = 365 * 24 * 3600 * 1000

export function workTimeAnchor(price: number): string {
  const ms = (price / AVG_ANNUAL_INCOME) * MS_PER_YEAR
  if (ms < 60_000) return `= 普通人工作 ${Math.max(1, Math.round(ms / 1000))} 秒`
  if (ms < 3600_000) return `= 普通人工作 ${Math.round(ms / 60_000)} 分钟`
  if (ms < 86_400_000) return `= 普通人工作 ${Math.round(ms / 3600_000)} 小时`
  if (ms < 30 * 86_400_000) return `= 普通人工作 ${Math.round(ms / 86_400_000)} 天`
  const years = ms / MS_PER_YEAR
  if (years < 1) return `= 普通人工作 ${Math.round(years * 12)} 个月`
  if (years < 100) return `= 普通人工作 ${Math.round(years)} 年`
  if (years < 10_000) return `= 普通人工作 ${formatFull(Math.round(years))} 年`
  return `= 普通人工作 ${formatAbbrev(Math.round(years))} 年`
}

export function schoolAnchor(spent: number): string {
  const cost = 280_000
  return `≈ 建造 ${formatAbbrev(Math.round(spent / cost))} 所希望小学`
}
