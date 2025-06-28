#!/usr/bin/env node
const { spawnSync } = require('child_process')
const args = process.argv.slice(2).filter(a => a !== '-b').filter(a => a !== '--noEmit')
const result = spawnSync(require.resolve('typescript/bin/tsc'), ['--noEmit', ...args], { stdio: 'inherit' })
process.exitCode = result.status
