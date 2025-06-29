import path from 'path'
import { run } from '../..'

jest.mock('axios-cookiejar-support', () => ({ wrapper: (a: unknown) => a }))

describe('fineco sandbox e2e', () => {
  it('run() returns true with fixtures', async () => {
    const credentials = path.join(__dirname, 'fixtures/credentials.json')
    const argv = process.argv
    process.argv = ['node', 'test', credentials]
    const result = await run()
    process.argv = argv
    expect(result).toBe(true)
  })
})
