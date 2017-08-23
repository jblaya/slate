
import assert from 'assert'

export default function (state) {
  const { selection } = state

  let next = state
    .transform()
    .moveNodeByKey('key2', 'key1', 0)
    .apply()
    .state

    .transform()
    .undo()
    .apply()
    .state

  assert.deepEqual(next.selection.toJS(), selection.toJS())
  return next
}
