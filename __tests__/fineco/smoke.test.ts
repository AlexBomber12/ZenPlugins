import path from 'path'
import fs from 'fs'
import { run } from '../../src/plugins/fineco-it'

jest.mock('axios-cookiejar-support', () => ({ wrapper: (a: unknown) => a }))

describe('fineco smoke', () => {
  const prefsPath = path.join(__dirname, 'prefs.smoke.json')

  beforeAll(async () => {
    const prefs = { login: 'ANY', password: 'ANY', fromDate: '2024-01-01', sandbox: true }
    await fs.promises.writeFile(prefsPath, JSON.stringify(prefs))
  })

  it('run() outputs accounts and transactions', async () => {
    const argv = process.argv
    process.argv = ['node', 'test', prefsPath]
    const logs: string[] = []
    const origLog = console.log
    console.log = (...args: unknown[]) => { logs.push(String(args[0])) }
    await run()
    console.log = origLog
    process.argv = argv
    const jsonLine = logs.find(l => l.trim().startsWith('{')) || '{}'
    const data = JSON.parse(jsonLine)
    expect(Array.isArray(data.accounts) && data.accounts.length).toBeTruthy()
    expect(Array.isArray(data.transactions) && data.transactions.length).toBeTruthy()
  })
})
