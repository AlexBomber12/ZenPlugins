/* eslint-disable import/first */
import axios, { AxiosInstance } from 'axios'
import { CookieJar } from 'tough-cookie'

import { ZenMoney } from '../../sdk' // <-- теперь локальный shim
import { InvalidLoginOrPasswordError } from '../../errors'
import { makeHeaders } from './helpers'

// ------------------------------------------------------------------

const BASE_URL = 'https://finecobank.germany-2.evergage.com'
const LOGIN_PATH = '/v1/public/chql-prospect/vit/status'

interface LoginResponse {
  status?: string
}

export async function login (
  jar: CookieJar,
  login: string,
  password: string,
  agent?: AxiosInstance
): Promise<CookieJar> {
  // ----------------------------------------------------------------
  // eslint-disable-next-line import/no-unresolved
  const { wrapper } = await import('axios-cookiejar-support')
  const client = wrapper(agent ?? axios.create({ baseURL: BASE_URL }))
  client.defaults.jar = jar
  // ----------------------------------------------------------------

  const resp = await client.post<LoginResponse>(
    LOGIN_PATH,
    { user: login, pass: password },
    { headers: makeHeaders() }
  )

  if (resp.data?.status !== 'OK') {
    throw new InvalidLoginOrPasswordError()
  }

  ZenMoney.log('Fineco – auth OK')
  return jar
}

// ------------------------------------------------------------------
const OVERVIEW_PATH = '/api/overview'
const MOVEMENTS_PATH = '/api/movements'

import type { RawOverview, RawMovement } from './models'

async function apiGET<T> (
  client: AxiosInstance,
  url: string,
  params?: Record<string, string | number>
): Promise<T> {
  const resp = await client.get<T>(url, {
    headers: makeHeaders(),
    params
  })
  return resp.data
}

export async function fetchAccounts (
  jar: CookieJar,
  agent?: AxiosInstance
): Promise<Record<string, RawOverview>> {
  // eslint-disable-next-line import/no-unresolved
  const { wrapper } = await import('axios-cookiejar-support')
  const client = wrapper(agent ?? axios.create({ baseURL: BASE_URL }))
  client.defaults.jar = jar
  return await apiGET<Record<string, RawOverview>>(client, OVERVIEW_PATH)
}

interface MovementsPage {
  movements: Record<string, RawMovement[]>
  nextPage?: number
}

export async function fetchTransactions (
  jar: CookieJar,
  fromDate?: string,
  agent?: AxiosInstance
): Promise<Record<string, RawMovement[]>> {
  // eslint-disable-next-line import/no-unresolved
  const { wrapper } = await import('axios-cookiejar-support')
  const client = wrapper(agent ?? axios.create({ baseURL: BASE_URL }))
  client.defaults.jar = jar

  const all: Record<string, RawMovement[]> = {}
  let page = 0

  while (true) {
    const pageData = await apiGET<MovementsPage>(client, MOVEMENTS_PATH, {
      ...(fromDate !== undefined ? { fromDate } : {}),
      page
    })
    for (const [iban, list] of Object.entries(pageData.movements)) {
      if (all[iban] == null) all[iban] = []
      all[iban].push(...list)
    }
    if (pageData.nextPage == null) break
    page = pageData.nextPage
  }

  return all
}
