import { convertAccounts } from '../../../converters'
import type { RawOverview } from '../../../models'

describe('convertAccounts', () => {
  it('converts multiple balances', () => {
    const overview: Record<string, RawOverview> = {
      ACC1: {
        accountId: 'ACC1',
        accountName: 'Credit Card',
        balances: {
          EUR: { iban: 'ITACC1EUR', accountBalance: 45600.24 },
          USD: { iban: 'ITACC1USD', accountBalance: 0 }
        }
      }
    }

    expect(convertAccounts(overview)).toEqual([
      {
        id: 'ITACC1EUR',
        title: 'Credit Card EUR',
        type: 'checking',
        instrument: 'EUR',
        balance: 45600.24,
        syncID: ['ITACC1EUR']
      },
      {
        id: 'ITACC1USD',
        title: 'Credit Card USD',
        type: 'checking',
        instrument: 'USD',
        balance: 0,
        syncID: ['ITACC1USD']
      }
    ])
  })
})
