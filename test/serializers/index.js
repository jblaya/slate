
import React from 'react'
import assert from 'assert'
import fs from 'fs'
import isPlainObject from 'is-plain-object'
import parse5 from 'parse5'
import readYaml from 'read-yaml-promise'
import { Html, Plain, Raw } from '../..'
import { Iterable } from 'immutable'
import { basename, extname, resolve } from 'path'

/**
 * Tests.
 */

describe('serializers', () => {
  describe('html', () => {
    describe('deserialize()', () => {
      const dir = resolve(__dirname, './html/deserialize')
      const tests = fs.readdirSync(dir)

      for (const test of tests) {
        if (test[0] === '.') continue

        it(test, async () => {
          const innerDir = resolve(dir, test)
          const htmlOpts = Object.assign({}, require(innerDir).default, { parseHtml: parse5.parseFragment })
          const html = new Html(htmlOpts)
          const input = fs.readFileSync(resolve(innerDir, 'input.html'), 'utf8')
          const expected = await readYaml(resolve(innerDir, 'output.yaml'))
          const state = html.deserialize(input)
          const json = state.toJSON()
          assert.deepEqual(json, expected)
        })
      }

      it('optionally returns a raw representation', () => {
        const fixture = require('./html/deserialize/block').default
        const htmlOpts = Object.assign({}, fixture, { parseHtml: parse5.parseFragment })
        const html = new Html(htmlOpts)
        const input = fs.readFileSync(resolve(__dirname, './html/deserialize/block/input.html'), 'utf8')
        const serialized = html.deserialize(input, { toRaw: true })
        assert(isPlainObject(serialized))
      })

      it('optionally does not normalize', () => {
        const fixture = require('./html/deserialize/inline-with-is-void').default
        const htmlOpts = Object.assign({}, fixture, { parseHtml: parse5.parseFragment })
        const html = new Html(htmlOpts)
        const input = fs.readFileSync(resolve(__dirname, './html/deserialize/inline-with-is-void/input.html'), 'utf8')
        const serialized = html.deserialize(input, { toRaw: true, normalize: false })
        assert.deepEqual(serialized, {
          kind: 'state',
          document: {
            kind: 'document',
            data: {},
            nodes: [
              {
                kind: 'block',
                type: 'paragraph',
                nodes: [
                  {
                    kind: 'inline',
                    type: 'emoji',
                    isVoid: true,
                  }
                ]
              }
            ]
          }
        })
      })
    })

    describe('serialize()', () => {
      const dir = resolve(__dirname, './html/serialize')
      const tests = fs.readdirSync(dir)

      for (const test of tests) {
        if (test[0] === '.') continue
        it(test, async () => {
          const innerDir = resolve(dir, test)
          const htmlOpts = Object.assign({}, require(innerDir).default, { parseHtml: parse5.parseFragment })
          const html = new Html(htmlOpts)
          const input = await readYaml(resolve(innerDir, 'input.yaml'))
          const expected = fs.readFileSync(resolve(innerDir, 'output.html'), 'utf8')
          const state = Raw.deserialize(input)
          const serialized = html.serialize(state)
          assert.deepEqual(serialized, expected.trim())
        })
      }

      it('optionally returns an iterable list of React elements', async () => {
        const fixture = require('./html/serialize/block-nested').default
        const htmlOpts = Object.assign({}, fixture, { parseHtml: parse5.parseFragment })
        const html = new Html(htmlOpts)
        const input = await readYaml(resolve(__dirname, './html/serialize/block-nested/input.yaml'))
        const state = Raw.deserialize(input)
        const serialized = html.serialize(state, { render: false })
        assert(Iterable.isIterable(serialized), 'did not return an interable list')
        assert(React.isValidElement(serialized.first()), 'did not return valid React elements')
      })
    })
  })

  describe('plain', () => {
    describe('deserialize()', () => {
      const dir = resolve(__dirname, './plain/deserialize')
      const tests = fs.readdirSync(dir)

      for (const test of tests) {
        if (test[0] === '.') continue
        it(test, async () => {
          const innerDir = resolve(dir, test)
          const expected = await readYaml(resolve(innerDir, 'output.yaml'))
          const input = fs.readFileSync(resolve(innerDir, 'input.txt'), 'utf8')
          const state = Plain.deserialize(input)
          const json = state.toJS()
          assert.deepEqual(json, expected)
        })
      }

      it('optionally returns a raw representation', () => {
        const input = fs.readFileSync(resolve(__dirname, './plain/deserialize/line/input.txt'), 'utf8')
        const serialized = Plain.deserialize(input, { toRaw: true })
        assert(isPlainObject(serialized))
      })
    })

    describe('serialize()', () => {
      const dir = resolve(__dirname, './plain/serialize')
      const tests = fs.readdirSync(dir)

      for (const test of tests) {
        if (test[0] === '.') continue
        it(test, async () => {
          const innerDir = resolve(dir, test)
          const input = await readYaml(resolve(innerDir, 'input.yaml'))
          const expected = fs.readFileSync(resolve(innerDir, 'output.txt'), 'utf8')
          const state = Raw.deserialize(input)
          const serialized = Plain.serialize(state)
          assert.deepEqual(serialized, expected)
        })
      }
    })
  })

  describe('raw', () => {
    describe('deserialize()', () => {
      const dir = resolve(__dirname, './raw/deserialize')
      const tests = fs.readdirSync(dir).filter(t => t[0] != '.').map(t => basename(t, extname(t)))

      for (const test of tests) {
        it(test, async () => {
          const {
            input,
            output,
            options = {},
          } = require(resolve(dir, test))

          const actual = Raw.deserialize(input, options).toJSON()
          const expected = output.toJSON()
          assert.deepEqual(actual, expected)
        })
      }
    })

    describe('serialize()', () => {
      const dir = resolve(__dirname, './raw/serialize')
      const tests = fs.readdirSync(dir).filter(t => t[0] != '.').map(t => basename(t, extname(t)))

      for (const test of tests) {
        it(test, async () => {
          const {
            input,
            output,
            options = {},
          } = require(resolve(dir, test))

          const actual = Raw.serialize(input, options)
          const expected = output
          assert.deepEqual(actual, expected)
        })
      }
    })
  })
})
