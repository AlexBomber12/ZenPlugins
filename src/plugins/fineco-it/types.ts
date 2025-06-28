export interface ZenmoneyAccount {
  id: string
  title: string
  type: string
  instrument: string
  balance: number
  syncID: string[]
}

export interface ZenmoneyTransaction {
  id: string
  account: string
  date: string
  payee: string
  memo: string
  inflow: number
  outflow: number
}

export interface PluginArgs {
  preferences?: import('./models').Preferences
  fromDate?: Date
}

export type PluginHandler = (args: PluginArgs) => Promise<{
  accounts: ZenmoneyAccount[]
  transactions: ZenmoneyTransaction[]
}>
