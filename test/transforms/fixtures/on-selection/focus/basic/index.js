
import assert from 'assert'

export default function (state) {
  const { startText, selection } = state
  const sel = selection.merge({
    isFocused: true
  })

  const next = state
    .transform()
    .focus()
    .state

  assert.deepEqual(
    next.selection.toJS(),
    sel.toJS()
  )
}
