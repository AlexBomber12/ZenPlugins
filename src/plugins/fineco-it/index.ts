// ========================= index.ts =========================
import { PluginHandler } from '../../types'
import { authorize, loadAccountsAndTx } from './api'
import { convertAccounts, convertTransactions } from './converters'

export const scrape: PluginHandler = async (args) => {
  const { preferences = {}, fromDate } = (args ?? {}) as {
    preferences: { login?: string, password?: string, startDate?: string }
    fromDate?: string | undefined
  }

  const login = preferences.login ?? ''
  const password = preferences.password ?? ''
  if (login === '' || password === '') {
    throw new Error('Missing login/password in preferences')
  }

  const jar: Record<string, unknown> = {}
  await authorize(login, password, jar)

  const { overview, movements } = await loadAccountsAndTx(
    jar,
    fromDate ?? preferences.startDate
  )

  return {
    accounts: convertAccounts(overview),
    transactions: convertTransactions(movements)
  }
}

export default scrape
