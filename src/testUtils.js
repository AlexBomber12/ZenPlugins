import omit from 'lodash-es/omit'
import util from 'util'

export function installFetchMockDeveloperFriendlyFallback (fetchMock) {
  global.beforeEach(() => {
    fetchMock.catch((url, opts) => {
      throw new Error(util.format('Unmatched fetch request', {
        ...omit(opts, ['body']),
        matcher: {
          [util.inspect.custom || 'inspect']: () => `(url, {body}) => url === ${JSON.stringify(url)} && isEqual(JSON.parse(body), ${opts.body})`
        }
      }))
    })
  })
  global.afterEach(() => {
    fetchMock.reset()
    fetchMock.restore()
  })
}
