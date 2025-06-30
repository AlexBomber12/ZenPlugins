/* eslint-disable import/first */
import axios from 'axios'
import type { AxiosInstance } from 'axios'
import type { CookieJar } from 'tough-cookie'

import { ZenMoney } from '../../sdk' // <-- теперь локальный shim
import { InvalidLoginOrPasswordError, AuthTimeoutError, BankApiUnavailable, UnexpectedResponseError } from '../../errors'
import { delay } from '../../common/utils'
import { makeHeaders } from './helpers'

// ------------------------------------------------------------------

const BASE_URL = 'https://finecobank.germany-2.evergage.com'
const LOGIN_PATH = '/v1/public/chql-prospect/vit/status'
const MAX_AUTH_POLL = 3
const AUTH_POLL_DELAY = 500

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
  const client = wrapper(agent ?? axios.create({ baseURL: BASE_URL, proxy: false }))
  client.defaults.jar = jar
  // ----------------------------------------------------------------

  const resp = await client.post<LoginResponse>(
    LOGIN_PATH,
    { user: login, pass: password },
    { headers: makeHeaders() }
  )

  let status = resp.data?.status
  let attempt = 0
  while (status === 'PENDING') {
    if (attempt >= MAX_AUTH_POLL) {
      throw new AuthTimeoutError()
    }
    await delay(AUTH_POLL_DELAY * Math.pow(2, attempt))
    const pollResp = await client.post<LoginResponse>(
      LOGIN_PATH,
      { user: login, pass: password },
      { headers: makeHeaders() }
    )
    status = pollResp.data?.status
    attempt++
  }

  if (status !== 'OK') {
    throw new InvalidLoginOrPasswordError()
  }

  ZenMoney.log('Fineco – auth OK')
  return jar
}

// ------------------------------------------------------------------
const OVERVIEW_PATH = '/api/overview'
const MOVEMENTS_PATH = '/api/movements'
const MAX_RETRIES = 3
const RETRY_DELAY = 100

import type { RawOverview, RawMovement } from './models'

async function apiGET<T> (
  client: AxiosInstance,
  url: string,
  params?: Record<string, string | number>
): Promise<T> {
  let attempt = 0
  let delayMs = RETRY_DELAY
  while (true) {
    try {
      const resp = await client.get<T>(url, {
        headers: makeHeaders(),
        params
      })
      if (resp.status >= 500) {
        throw new Error(`status ${resp.status}`)
      }
      return resp.data
    } catch (e) {
      if (e instanceof SyntaxError) {
        throw new UnexpectedResponseError()
      }
      attempt++
      if (attempt >= MAX_RETRIES) {
        throw new BankApiUnavailable()
      }
      await delay(delayMs)
      delayMs *= 2
    }
  }
}

export async function fetchAccounts (
  jar: CookieJar,
  agent?: AxiosInstance
): Promise<Record<string, RawOverview>> {
  // eslint-disable-next-line import/no-unresolved
  const { wrapper } = await import('axios-cookiejar-support')
  const client = wrapper(agent ?? axios.create({ baseURL: BASE_URL, proxy: false }))
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
  const client = wrapper(agent ?? axios.create({ baseURL: BASE_URL, proxy: false }))
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
      const accList = all[iban]!
      accList.push(...list)
    }
    if (pageData.nextPage == null) break
    page = pageData.nextPage
  }

  return all
}
