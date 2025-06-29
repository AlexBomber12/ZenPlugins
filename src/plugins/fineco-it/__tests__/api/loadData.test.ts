import axios from 'axios'
import { CookieJar } from 'tough-cookie'
import { authorize, loadAccountsAndTx } from '../../api'
import * as fetchApi from '../../fetchApi'
import { RawOverview, RawMovement } from '../../models'

jest.mock('axios-cookiejar-support', () => ({ wrapper: (a: unknown) => a }))
jest.mock('../../fetchApi')
const mockedLogin = fetchApi as jest.Mocked<typeof fetchApi>

describe('api', () => {
  it('authorize delegates to login', async () => {
    const jar = new CookieJar()
    mockedLogin.login.mockResolvedValue(jar)
    const result = await authorize('me', 'p', jar)
    expect(mockedLogin.login).toHaveBeenCalledWith(jar, 'me', 'p', undefined)
    expect(result).toBe(jar)
  })

  it('loadAccountsAndTx returns data', async () => {
    const overview: Record<string, RawOverview> = { ACC1: { accountId: 'ACC1' } }
    const movements: Record<string, RawMovement[]> = { IBAN: [{ movementId: '1', operationDate: '2024-01-05', amount: 1 }] }
    const agent = axios.create({
      adapter: async config => {
        if (config.url === '/api/overview') {
          return { status: 200, statusText: 'OK', data: overview, headers: {}, config }
        }
        if (config.url === '/api/movements') {
          return { status: 200, statusText: 'OK', data: movements, headers: {}, config }
        }
        return { status: 404, statusText: 'Not Found', data: {}, headers: {}, config }
      }
    })
    const res = await loadAccountsAndTx(new CookieJar(), undefined, agent)
    expect(res).toEqual({ overview, movements })
  })
})
