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
