import { observable, runInAction, ObservableMap } from 'mobx'
import { mapRemoved } from '../../src/map/mapRemoved'

type TestItem = {
  id: number
}
let observableMap: ObservableMap<number, TestItem>
let mirrorMap: Map<number, TestItem>

beforeEach(() => {
  observableMap = observable(new Map())
  mirrorMap = new Map()
  for (let i = 0; i < 10; i++) {
    observableMap.set(i, { id: i })
    mirrorMap.set(i, { id: i })
  }
})

describe('Map Removed', () => {
  test('react to removing items', () => {
    const collection = observable(new Map())
    const cb = jest.fn()
    const item1 = {
      key: 1,
      value: 'one'
    }
    const item2 = {
      key: 2,
      value: 'two'
    }
    collection.set(item1.key, item1.value)
    collection.set(item2.key, item2.value)

    mapRemoved(collection, cb)
    collection.delete(item1.key)
    collection.delete(item2.key)

    expect(cb.mock.calls[0][0]).toEqual([item1])
    expect(cb.mock.calls[1][0]).toEqual([item2])
    expect(cb).toHaveBeenCalledTimes(2)
  })
  test('react to removing all items at once', () => {
    const collection = observable(new Map())
    const cb = jest.fn()
    const item1 = {
      key: 1,
      value: 'one'
    }
    const item2 = {
      key: 2,
      value: 'two'
    }
    collection.set(item1.key, item1.value)
    collection.set(item2.key, item2.value)

    mapRemoved(collection, cb)
    collection.clear()

    expect(cb.mock.calls[0][0]).toEqual([item1, item2])
    expect(cb).toHaveBeenCalledTimes(1)
  })
  test('react to removing items - with delay', done => {
    const collection = observable(new Map())
    const cb = jest.fn().mockImplementation(() => {
      expect(cb.mock.calls[0][0]).toEqual([item1, item2])
      expect(cb).toHaveBeenCalledTimes(1)
      done()
    })
    const item1 = {
      key: 1,
      value: 'one'
    }
    const item2 = {
      key: 2,
      value: 'two'
    }
    collection.set(item1.key, item1.value)
    collection.set(item2.key, item2.value)

    mapRemoved(collection, cb, 10)
    collection.delete(item1.key)
    collection.delete(item2.key)
  })

  test('React to removing items when key is an object', () => {
    const collection = observable(new Map())
    const cb = jest.fn()
    const item1 = {
      key: { key: 1 },
      value: 'one'
    }
    const item2 = {
      key: { key: 2 },
      value: 'two'
    }

    mapRemoved(collection, cb)

    collection.set(item1.key, item1.value)
    collection.set(item2.key, item2.value)

    collection.delete(item1.key)
    collection.delete(item2.key)

    expect(cb.mock.calls[0][0]).toEqual([item1])
    expect(cb.mock.calls[1][0]).toEqual([item2])

    expect(cb).toHaveBeenCalledTimes(2)
  })
  test('Remove items - runInAction', () => {
    const collection = observable(new Map())
    const cb = jest.fn()
    const item1 = {
      key: 1,
      value: 'one'
    }
    const item2 = {
      key: 2,
      value: 'two'
    }
    runInAction(() => {
      collection.set(item1.key, item1.value)
      collection.set(item2.key, item2.value)
    })

    mapRemoved(collection, cb)

    runInAction(() => {
      collection.delete(item1.key)
      collection.delete(item2.key)
    })

    expect(cb.mock.calls[0][0]).toEqual([item1, item2])
    expect(cb).toHaveBeenCalledTimes(1)
  })

  test('React to mobx "map.replace" method', () => {
    const cb = jest.fn()
    const item1 = {
      key: 1,
      value: 'one'
    }
    const item2 = {
      key: 2,
      value: 'two'
    }
    const collection = observable(new Map())
    collection.set(item1.key, item1.value)
    collection.set(item2.key, item2.value)
    mapRemoved<number, string>(collection, cb)

    runInAction(() => {
      collection.replace({ who: 'Ivan', nick: 'Ikac' })
    })

    expect(cb.mock.calls[0][0]).toEqual([item1, item2])
    expect(cb).toHaveBeenCalledTimes(1)
  })
  test('Throw if passed in map is not an observable map', () => {
    expect(() => {
      mapRemoved(([] as unknown) as ObservableMap, jest.fn())
    }).toThrow(/Map as the first argument/)
  })
})
