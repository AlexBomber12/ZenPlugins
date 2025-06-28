import axios, { AxiosInstance } from 'axios'
import { CookieJar } from 'tough-cookie'
import { wrapper } from 'axios-cookiejar-support'

import { ZenMoney } from '../../sdk' // <-- теперь локальный shim
import { LoginFailedError } from '../../errors'
import { makeHeaders } from './helpers'

// ------------------------------------------------------------------

const BASE_URL = 'https://finecobank.germany-2.evergage.com'
const LOGIN_PATH = '/v1/public/chql-prospect/vit/status'

export async function login (
  jar: CookieJar,
  login: string,
  password: string,
  agent?: AxiosInstance
): Promise<CookieJar> {
  // ----------------------------------------------------------------
  const client = wrapper(agent ?? axios.create({ baseURL: BASE_URL, jar }))
  // ----------------------------------------------------------------

  const resp = await client.post(
    LOGIN_PATH,
    { user: login, pass: password },
    { headers: makeHeaders() }
  )

  if (resp.data?.status !== 'OK') {
    throw new LoginFailedError('Wrong login or password')
  }

  ZenMoney.log('Fineco – auth OK')
  return jar
}
