import { getAccountBalance } from '../../api'
import type { RawOverview } from '../../models'

describe('getAccountBalance', () => {
  it('returns balance for valid id', () => {
    const overview: Record<string, RawOverview> = {
      ACC1: {
        accountId: 'ACC1',
        accountBalance: { value: 200 }
      }
    }
    expect(getAccountBalance(overview, 'ACC1')).toBe(200)
  })

  it('returns undefined for invalid id', () => {
    const overview: Record<string, RawOverview> = {}
    expect(getAccountBalance(overview, '')).toBeUndefined()
    expect(getAccountBalance(overview, 'NO')).toBeUndefined()
  })
})
