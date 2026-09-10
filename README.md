# Broke the Billionaire

**《花不完，根本花不完》** —— 一款"花光首富财产"的 H5 解谜游戏。

给你 4000 亿美元，在全球最贵的商店里把它花光。听起来简单？利息每秒都在进账，而通关条件不止"花光"。

> 线上地址：<https://brokeb.pages.dev>

## 玩法

- **花钱解谜关卡制**：6 个关卡，每关有独特的约束条件——限时把每种商品各买一件、只买消耗品、与每秒 2% 的利息赛跑……
- **双条件通关**：花光 ≥99.9% 且满足关卡约束（如"至少买 15 种"）；精确清零有专属荣誉徽章
- **110 件真实商品**：从 6 美元的巨无霸到 62.5 万亿美元/克的反物质彩蛋，全部带价格依据三元组（计价基础 / 价格年份 / 数据来源）
- **猜价格每日一题**：种子随机出题，普通人视角感受财富数量级
- **信息分层**：极简 / 标准 / 沉浸三档预设——纯解谜玩家只见价格，想涨知识的玩家能看换算锚点、双视角对照与深度科普
- **大字模式**：根字号等比缩放，全站 UI 适配
- **战利品系统**：14 项成就、图鉴收藏、Canvas 分享战报

## 技术栈

| 层 | 选型 |
|---|---|
| 框架 | Vue 3.5（`<script setup>` + TS） |
| 构建 | Vite 8 + TypeScript 5.9 |
| 状态 | Pinia 4（setup store 风格） |
| 路由 | vue-router 5（hash 模式） |
| 样式 | Tailwind CSS 4（CSS-first `@theme`） |
| 组件 | reka-ui v2（Dialog / Switch / AlertDialog） |

无后端：存档存 localStorage（`btb-save-v1` / `btb-settings-v1`，含 schema version 与迁移），部署为纯静态站点。

## 快速开始

```bash
npm install
npm run dev        # 本地开发
npm run build      # 类型检查 + 产物构建
npm run preview    # 预览构建产物
```

## 部署

Cloudflare Pages，项目名 `brokeb`：

```bash
npm run deploy             # 构建 + 推送
npm run deploy:no-build    # 跳过构建直接推送
```

需要本机已通过 `npx wrangler login` 授权。

## 项目结构

```
src/
├── data/        # 商品(110)、关卡(6)、分类、成就、猜价格题库
├── stores/      # settings / progress / game / toast
├── components/  # 商品卡、详情抽屉、结算单、HUD、战利品等
├── views/       # 首页、选关、商店、图鉴、猜价格、设置、成就
├── utils/       # 金额格式化、存档、分享卡
└── types/       # 领域类型定义
docs/
├── GDD.md             # 游戏设计文档（设计基准）
├── EXECUTION_PLAN.md  # 执行计划（进度事实来源）
└── image-prompts.md   # 商品插画 prompt（插画暂缓，现用 emoji 方案）
```

## 设计原则

- **价格真实性**：商品价格均基于公开资料，标注计价基础、年份与来源；随行就市类数据（市值/金价）标注年份口径
- **教育 opt-in**：财富科普内容低频、分层出现，不绑架只想玩解谜的玩家
- **兼容性优先**：技术选型求稳，金额全程整数美元运算，避免浮点误差
- **法务边界**：不使用真实人名与商标图，统一以"首富"指代

## License

仅供学习交流使用。
