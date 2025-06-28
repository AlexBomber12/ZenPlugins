import axios, { AxiosInstance } from 'axios'
import { wrapper } from 'axios-cookiejar-support'
import { CookieJar } from 'tough-cookie'

import { ZenMoney } from '../../sdk'
import { makeHeaders } from './helpers'
import { login } from './fetchApi'
import { RawOverview, RawMovement } from './models'

const BASE_URL = 'https://finecobank.germany-2.evergage.com'
const OVERVIEW_PATH = '/api/overview'
const MOVEMENTS_PATH = '/api/movements'

export async function authorize (
  loginName: string,
  password: string,
  jar: CookieJar,
  agent?: AxiosInstance
): Promise<CookieJar> {
  return await login(jar, loginName, password, agent)
}

export async function loadAccountsAndTx (
  jar: CookieJar,
  fromDate?: string,
  agent?: AxiosInstance
): Promise<{ overview: Record<string, RawOverview>, movements: Record<string, RawMovement[]> }> {
  const client = wrapper(agent ?? axios.create({ baseURL: BASE_URL, jar }))
  const overviewResp = await client.get(OVERVIEW_PATH, { headers: makeHeaders() })
  const overview = overviewResp.data as Record<string, RawOverview>

  const movementsResp = await client.get(MOVEMENTS_PATH, {
    headers: makeHeaders(),
    params: fromDate ? { fromDate } : undefined
  })
  const movements = movementsResp.data as Record<string, RawMovement[]>

  ZenMoney.log('Fineco – loaded accounts and transactions')
  return { overview, movements }
}

export function getAccountBalance (
  overview: Record<string, RawOverview>,
  accId: string
): number | undefined {
  if (typeof accId !== 'string' || accId === '' || !overview[accId]) {
    return undefined
  }
  return overview[accId].accountBalance?.value
}
