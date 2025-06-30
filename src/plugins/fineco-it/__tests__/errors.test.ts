import nock from 'nock'
import axios from 'axios'
import { CookieJar } from 'tough-cookie'
import { login, fetchAccounts, fetchTransactions } from '../fetchApi'
import { BankApiUnavailable, AuthTimeoutError, UnexpectedResponseError } from '../../../errors'

jest.mock('axios-cookiejar-support', () => ({ __esModule: true, wrapper: (a: unknown) => a }))
jest.mock('../../../common/utils', () => ({ delay: async () => {} }))

const BASE_URL = 'https://finecobank.germany-2.evergage.com'
const LOGIN_PATH = '/v1/public/chql-prospect/vit/status'
const ACC_PATH = '/api/overview'
const MOV_PATH = '/api/movements'

describe('fineco negative paths with nock', () => {
  beforeAll(() => {
    process.env['HTTP_PROXY'] = ''
    process.env['HTTPS_PROXY'] = ''
  })
  afterEach(() => {
    nock.cleanAll()
  })

  it('500 on /accounts after retries -> BankApiUnavailable', async () => {
    nock(BASE_URL).get(ACC_PATH).times(3).reply(500, {}, { 'Content-Type': 'application/json' })
    await expect(fetchAccounts(new CookieJar())).rejects.toBeInstanceOf(BankApiUnavailable)
  })

  it('SCA pending exceeds timeout -> AuthTimeoutError', async () => {
    nock(BASE_URL).post(LOGIN_PATH).times(4).reply(200, { status: 'PENDING' }, { 'Content-Type': 'application/json' })
    await expect(login(new CookieJar(), 'u', 'p')).rejects.toBeInstanceOf(AuthTimeoutError)
  })

  it('Malformed JSON on /transactions -> UnexpectedResponseError', async () => {
    nock(BASE_URL).get(MOV_PATH).query(true).reply(200, 'oops', { 'Content-Type': 'application/json' })
    const agent = axios.create({ baseURL: BASE_URL, proxy: false, transformResponse: [data => JSON.parse(data)] })
    await expect(fetchTransactions(new CookieJar(), undefined, agent)).rejects.toBeInstanceOf(UnexpectedResponseError)
  })
})
