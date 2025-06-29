import axios from 'axios'
import { CookieJar } from 'tough-cookie'
import { login, fetchAccounts } from '../../src/plugins/fineco-it/fetchApi'
import { AuthTimeoutError, BankApiUnavailable } from '../../src/errors'

jest.mock('axios-cookiejar-support', () => ({ wrapper: (a: unknown) => a }))

describe('fineco errors', () => {
  it('SCA pending forever -> login() throws AuthTimeoutError', async () => {
    const agent = axios.create({
      adapter: async config => {
        return { status: 200, statusText: 'OK', data: { status: 'PENDING' }, headers: {}, config }
      }
    })
    await expect(login(new CookieJar(), 'user', 'pass', agent)).rejects.toBeInstanceOf(AuthTimeoutError)
  })

  it('500 on /accounts reproduced 3 retries -> fetchAccounts() throws BankApiUnavailable', async () => {
    let calls = 0
    const agent = axios.create({
      adapter: async config => {
        calls++
        return { status: 500, statusText: 'ERR', data: {}, headers: {}, config }
      }
    })
    await expect(fetchAccounts(new CookieJar(), agent)).rejects.toBeInstanceOf(BankApiUnavailable)
    expect(calls).toBe(3)
  })
})
