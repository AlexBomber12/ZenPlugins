#!/usr/bin/env node
const { execSync } = require('child_process')
const os = require('os')

const args = process.argv.slice(2)
let cmd = 'jest --coverage'
if (args[0] === 'fineco-it') {
  cmd = 'jest fineco-it --runTestsByPath __tests__/fineco/e2e.sandbox.test.ts __tests__/fineco/smoke.test.ts'
  if (args.length > 1) cmd += ' ' + args.slice(1).join(' ')
} else if (args.length > 0) {
  cmd += ' ' + args.join(' ')
}
execSync(cmd, {
  env: { ...process.env, NODE_OPTIONS: `--max-old-space-size=${Math.floor(os.totalmem() / (1024 * 1024))}` },
  stdio: 'inherit'
})
