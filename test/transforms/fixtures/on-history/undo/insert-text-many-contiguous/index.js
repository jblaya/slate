
import assert from 'assert'

export default function (state) {
  const { document, selection } = state
  const texts = document.getTexts()
  const first = texts.get(0)

  const next = state
    .transform()
    .collapseToStartOf(first)
    .insertText('text')
    .apply()
    .state

    .transform()
    .insertText('text')
    .apply()
    .state

    .transform()
    .undo()
    .apply()
    .state

  return next
}
