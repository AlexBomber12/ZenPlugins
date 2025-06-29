import { convertTransactions } from '../../../converters'
import type { RawMovement } from '../../../models'

describe('convertTransactions', () => {
  it('converts movements', () => {
    const movements: Record<string, RawMovement[]> = {
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

    expect(convertTransactions(movements)).toEqual([
      {
        id: '1',
        account: 'ITACC1EUR',
        date: '2024-01-05',
        payee: 'Shop',
        memo: '',
        inflow: 0,
        outflow: 10
      }
    ])
  })
})
