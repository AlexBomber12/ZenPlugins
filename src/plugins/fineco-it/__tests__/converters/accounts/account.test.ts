import { convertAccounts } from '../../../converters'
import type { RawOverview } from '../../../models'

describe('convertAccounts', () => {
  it('converts overview to accounts', () => {
    const overview: Record<string, RawOverview> = {
      ACC1: {
        accountId: 'ACC1',
        accountName: 'Fineco Account',
        balances: {
          EUR: { iban: 'ITACC1EUR', accountBalance: 150.5 }
        }
      }
    }

    expect(convertAccounts(overview)).toEqual([
      {
        id: 'ITACC1EUR',
        title: 'Fineco Account EUR',
        type: 'checking',
        instrument: 'EUR',
        balance: 150.5,
        syncID: ['ITACC1EUR']
      }
    ])
  })
})
