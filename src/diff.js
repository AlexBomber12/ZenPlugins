import deepDiff from 'deep-diff'
import flatMap from 'lodash-es/flatMap'

const prettifyDiffEntry = (diffEntry) => {
  if (diffEntry.kind === 'A') {
    return prettifyDiffEntry(Object.assign({ path: diffEntry.path.concat(diffEntry.index) }, diffEntry.item))
  }
  const lines = []
  if (diffEntry.kind === 'E' || diffEntry.kind === 'D') {
    lines.push(`− ${JSON.stringify(diffEntry.path)}: ${JSON.stringify(diffEntry.lhs)}`)
  }
  if (diffEntry.kind === 'E' || diffEntry.kind === 'N') {
    lines.push(`+ ${JSON.stringify(diffEntry.path)}: ${JSON.stringify(diffEntry.rhs)}`)
  }
  return lines
}

export const prettyDeepDiff = (x, y) => flatMap(deepDiff(x, y), (diffEntry) => prettifyDiffEntry(diffEntry))
