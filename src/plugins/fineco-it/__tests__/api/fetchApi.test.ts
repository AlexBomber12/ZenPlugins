import axios from 'axios'
import { CookieJar } from 'tough-cookie'
import { login, fetchAccounts, fetchTransactions } from '../../fetchApi'
import { InvalidLoginOrPasswordError } from '../../../../errors'
import type { RawOverview, RawMovement } from '../../models'

jest.mock('axios-cookiejar-support', () => ({ wrapper: (a: unknown) => a }))

describe('fetchApi', () => {
  it('login returns jar on success', async () => {
    const agent = axios.create({
      adapter: async config => {
        expect(config.url).toBe('/v1/public/chql-prospect/vit/status')
        return { status: 200, statusText: 'OK', data: { status: 'OK' }, headers: {}, config }
      }
    })
    const jar = new CookieJar()
    const result = await login(jar, 'user', 'pass', agent)
    expect(result).toBe(jar)
  })

  it('login throws on failure', async () => {
    const agent = axios.create({
      adapter: async config => {
        return { status: 200, statusText: 'OK', data: { status: 'NO' }, headers: {}, config }
      }
    })
    await expect(login(new CookieJar(), 'u', 'p', agent)).rejects.toBeInstanceOf(InvalidLoginOrPasswordError)
  })

  it('fetchAccounts returns overview', async () => {
    const overview: Record<string, RawOverview> = {
      ACC1: { accountId: 'ACC1' }
    }
    const agent = axios.create({
      adapter: async config => {
        expect(config.url).toBe('/api/overview')
        return { status: 200, statusText: 'OK', data: overview, headers: {}, config }
      }
    })
    const result = await fetchAccounts(new CookieJar(), agent)
    expect(result).toEqual(overview)
  })

  it('fetchTransactions merges paginated data', async () => {
    const page0: RawMovement = { movementId: '1', operationDate: '2024-01-05', amount: 1 }
    const page1: RawMovement = { movementId: '2', operationDate: '2024-01-06', amount: 2 }
    let call = 0
    const agent = axios.create({
      adapter: async config => {
        const params = config.params as Record<string, unknown>
        if (call === 0) {
          expect(params).toMatchObject({ fromDate: '2024-01-01', page: 0 })
          call++
          return {
            status: 200,
            statusText: 'OK',
            data: { movements: { IBAN: [page0] }, nextPage: 1 },
            headers: {},
            config
          }
        }
        expect(params).toMatchObject({ fromDate: '2024-01-01', page: 1 })
        return {
          status: 200,
          statusText: 'OK',
          data: { movements: { IBAN: [page1] } },
          headers: {},
          config
        }
      }
    })
    const res = await fetchTransactions(new CookieJar(), '2024-01-01', agent)
    expect(res).toEqual({ IBAN: [page0, page1] })
  })
})
