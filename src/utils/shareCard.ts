export interface ShareCardOptions {
  levelName: string
  spent: number
  items: number
  kinds: number
  durationText: string
  topCategories: { name: string; amount: number }[]
  exactZero: boolean
}

const W = 750
const H = 1150

const INK = '#0a0a12'
const INK_LIGHT = '#1d1d30'
const GOLD = '#e4bf5f'
const GOLD_DIM = '#b8893a'
const PAPER = '#f5f2ea'
const PAPER_DIM = '#9a947f'

function font(size: number, weight = '400'): string {
  return `${weight} ${size}px system-ui, "PingFang SC", "Microsoft YaHei", sans-serif`
}

function fmt(n: number): string {
  return `$${n.toLocaleString('en-US')}`
}

function abbrev(n: number): string {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(1)}T`
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`
  return fmt(n)
}

export function renderSettlementCard(o: ShareCardOptions): string {
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''

  ctx.fillStyle = INK
  ctx.fillRect(0, 0, W, H)

  ctx.fillStyle = GOLD
  ctx.font = font(30, '600')
  ctx.textAlign = 'center'
  ctx.fillText('花不完，根本花不完', W / 2, 96)

  ctx.fillStyle = PAPER_DIM
  ctx.font = font(20)
  ctx.fillText('你以为的奢侈，只是别人的利息', W / 2, 134)

  ctx.fillStyle = INK_LIGHT
  ctx.beginPath()
  ctx.roundRect(48, 180, W - 96, 96, 20)
  ctx.fill()
  ctx.fillStyle = PAPER
  ctx.font = font(26, '600')
  ctx.fillText(o.levelName, W / 2, 226)
  ctx.fillStyle = PAPER_DIM
  ctx.font = font(18)
  ctx.fillText(o.exactZero ? '🏅 一分不剩 · 荣誉达成' : '通关战报', W / 2, 256)

  ctx.fillStyle = GOLD
  const spentText = fmt(o.spent)
  const size = spentText.length > 16 ? 56 : spentText.length > 12 ? 68 : 84
  ctx.font = font(size, '700')
  ctx.fillText(spentText, W / 2, 400)

  ctx.fillStyle = PAPER_DIM
  ctx.font = font(20)
  ctx.fillText('成功花掉', W / 2, 320)

  const cols: [string, string][] = [
    ['商品件数', `${o.items} 件`],
    ['商品种类', `${o.kinds} 种`],
    ['用时', o.durationText],
  ]
  cols.forEach(([label, value], i) => {
    const x = W / 6 + (W / 3) * i
    ctx.fillStyle = PAPER_DIM
    ctx.font = font(18)
    ctx.fillText(label, x, 490)
    ctx.fillStyle = PAPER
    ctx.font = font(32, '600')
    ctx.fillText(value, x, 532)
  })

  ctx.fillStyle = PAPER_DIM
  ctx.font = font(18)
  ctx.textAlign = 'left'
  ctx.fillText('消费结构', 72, 620)

  const top = o.topCategories.slice(0, 3)
  const max = top[0]?.amount ?? 1
  top.forEach((c, i) => {
    const y = 660 + i * 74
    ctx.fillStyle = PAPER
    ctx.font = font(20)
    ctx.fillText(c.name, 72, y)
    ctx.fillStyle = PAPER_DIM
    ctx.textAlign = 'right'
    ctx.fillText(abbrev(c.amount), W - 72, y)
    ctx.textAlign = 'left'
    ctx.fillStyle = '#2a2a44'
    ctx.beginPath()
    ctx.roundRect(72, y + 14, W - 144, 14, 7)
    ctx.fill()
    ctx.fillStyle = GOLD_DIM
    ctx.beginPath()
    ctx.roundRect(72, y + 14, Math.max(28, ((W - 144) * c.amount) / max), 14, 7)
    ctx.fill()
  })

  const anchor = topCategoriesAnchor(o)
  ctx.fillStyle = PAPER_DIM
  ctx.font = font(20)
  ctx.textAlign = 'center'
  ctx.fillText(anchor, W / 2, 950)

  ctx.fillStyle = '#3b3b5c'
  ctx.font = font(16)
  ctx.fillText('价格基于公开资料近似估算 · 仅用于体验财富数量级', W / 2, 1030)

  return canvas.toDataURL('image/png')
}

function topCategoriesAnchor(o: ShareCardOptions): string {
  const names = o.topCategories.slice(0, 2).map((c) => c.name)
  return `我的钱主要流向了：${names.join('、')}`
}
