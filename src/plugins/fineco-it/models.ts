import { AccountOrCard } from '../../types/zenmoney'

// Stored in persistent storage
export interface Auth {
  accessToken: string
}

// Consists of everything that is needed in
// authorized requests, e.g. socket handles, session tokens
// Not stored!
export interface Session {
  auth: Auth
}

// Input preferences from schema in preferences.xml
export interface Preferences {
  login: string
  password: string
}

export interface Product {
  id: string
  transactionNode: string
}

export interface ConvertResult {
  products: Product[]
  account: AccountOrCard
}

export interface RawOverview {
  accountId: string
  accountName?: string
  accountBalance?: { value: number }
  balances?: Record<string, {
    iban?: string
    accountBalance?: number
  }>
}

export interface RawMovement {
  movementId: string
  operationDate: string
  description?: string
  extendedDescription?: string
  amount: number
}
