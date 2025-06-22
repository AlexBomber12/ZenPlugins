// ===================== converters.ts =======================
import { ZenmoneyAccount, ZenmoneyTransaction } from '../../types'
import { RawOverview, RawMovement } from './fetchApi'

export function convertAccounts (overview: Record<string, RawOverview>): ZenmoneyAccount[] {
  const accOut: ZenmoneyAccount[] = []
  for (const acc of Object.values(overview)) {
    const balances = acc.balances ?? {}
    for (const [cur, bal] of Object.entries(balances)) {
      const iban = bal.iban ?? `${acc.accountId}-${cur}`
      accOut.push({
        id: iban,
        title: `${acc.accountName ?? 'Fineco'} ${cur}`,
        type: 'checking',
        instrument: cur,
        balance: bal.accountBalance ?? 0,
        syncID: [iban]
      })
    }
  }
  return accOut
}

export function convertTransactions (movements: Record<string, RawMovement[]>): ZenmoneyTransaction[] {
  const txOut: ZenmoneyTransaction[] = []
  for (const [iban, list] of Object.entries(movements)) {
    for (const m of list) {
      txOut.push({
        id: m.movementId,
        account: iban,
        date: m.operationDate.slice(0, 10),
        payee: m.description ?? '—',
        memo: m.extendedDescription ?? '',
        inflow: m.amount > 0 ? m.amount : 0,
        outflow: m.amount < 0 ? Math.abs(m.amount) : 0
      })
    }
  }
  return txOut
}

// ℹ️  alias for legacy unit‑tests written before we renamed the helper
//    allows both `convertTransaction` and `convertTransactions`
export const convertTransaction = convertTransactions
