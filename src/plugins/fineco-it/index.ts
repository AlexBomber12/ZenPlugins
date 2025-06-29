// ========================= index.ts =========================
import { CookieJar } from 'tough-cookie'
import { authorize, loadAccountsAndTx } from './api'
import { convertAccounts, convertTransactions } from './converters'
import type { Preferences } from './models'
import type { PluginHandler } from './types'

export const scrape: PluginHandler = async ({ preferences, fromDate }: { preferences?: Preferences, fromDate?: Date }) => {
  const { login = '', password = '' } = preferences ?? {}
  if (login === '' || password === '') {
    throw new Error('Missing login/password in preferences')
  }

  const jar = new CookieJar()
  await authorize(login, password, jar)

  const { overview, movements } = await loadAccountsAndTx(
    jar,
    fromDate ? fromDate.toISOString().slice(0, 10) : undefined
  )

  return {
    accounts: convertAccounts(overview),
    transactions: convertTransactions(movements)
  }
}

export default scrape

export async function run (): Promise<void> {
  const fs = await import('fs')
  const axios = await import('axios')

  const credentialsPath = process.argv.find(arg => arg.endsWith('.json')) ?? ''
  if (credentialsPath === '') {
    console.error('Credentials file path is required')
    return
  }
  const raw = await fs.promises.readFile(credentialsPath, 'utf8')
  const preferences: Preferences = JSON.parse(raw)

  const overviewMock = {
    ACC1: {
      accountId: 'ACC1',
      accountName: 'Fineco Account',
      balances: { EUR: { iban: 'ITACC1EUR', accountBalance: 150.5 } }
    }
  }
  const movementsMock = {
    ITACC1EUR: [
      {
        movementId: '1',
        operationDate: '2024-01-05',
        description: 'Shop',
        extendedDescription: '',
        amount: -10
      }
    ]
  }

  const agent = axios.default.create({
    baseURL: 'https://finecobank.germany-2.evergage.com',
    adapter: async (config) => {
      if (config.url === '/v1/public/chql-prospect/vit/status' && config.method === 'post') {
        return { status: 200, statusText: 'OK', data: { status: 'OK' }, headers: {}, config }
      }
      if (config.url === '/api/overview' && config.method === 'get') {
        return { status: 200, statusText: 'OK', data: overviewMock, headers: {}, config }
      }
      if (config.url === '/api/movements' && config.method === 'get') {
        return { status: 200, statusText: 'OK', data: movementsMock, headers: {}, config }
      }
      return { status: 404, statusText: 'Not Found', data: {}, headers: {}, config }
    }
  })

  const jar = new CookieJar()
  await authorize(preferences.login, preferences.password, jar, agent)
  const { overview, movements } = await loadAccountsAndTx(jar, undefined, agent)
  const result = {
    accounts: convertAccounts(overview),
    transactions: convertTransactions(movements)
  }
  console.log(JSON.stringify(result, null, 2))
}
