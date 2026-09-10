import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'

const projectName = 'brokeb'
const skipBuild = process.argv.includes('--no-build')

function run(cmd, args) {
  const result = spawnSync(cmd, args, { stdio: 'inherit', shell: true })
  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}

if (!skipBuild) {
  console.log('[deploy] building...')
  run('npm', ['run', 'build'])
}

if (!existsSync('dist/index.html')) {
  console.error('[deploy] dist/index.html not found. Run a build first.')
  process.exit(1)
}

console.log('[deploy] pushing to Cloudflare Pages...')
run('npx', ['wrangler', 'pages', 'deploy', 'dist', `--project-name=${projectName}`, '--commit-dirty=true'])

console.log(`[deploy] done. https://${projectName}.pages.dev`)
