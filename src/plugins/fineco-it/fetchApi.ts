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
