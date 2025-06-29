import { makeHeaders } from '../helpers'

describe('makeHeaders', () => {
  it('returns user agent and accept headers', () => {
    expect(makeHeaders()).toEqual({
      'User-Agent': 'Mozilla/5.0 (ZenPlugins)',
      Accept: 'application/json, text/plain, */*'
    })
  })
})
