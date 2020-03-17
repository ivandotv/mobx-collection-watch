import { observable, runInAction, ObservableMap } from 'mobx'
import { mapAdded } from '../../src/map/mapAdded'

describe('Map Added', () => {
  test('Add to map primitive key (number)', () => {
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

    mapAdded<number, string>(collection, cb)
    collection.set(item1.key, item1.value)
    collection.set(item2.key, item2.value)

    expect(cb.mock.calls[0][0]).toEqual([item1])
    expect(cb.mock.calls[1][0]).toEqual([item2])

    expect(cb).toHaveBeenCalledTimes(2)
  })

  test('Add to map - object as key', () => {
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

    mapAdded<number, string>(collection, cb)
    collection.set(item1.key, item1.value)
    collection.set(item2.key, item2.value)

    expect(cb.mock.calls[0][0]).toEqual([item1])
    expect(cb.mock.calls[1][0]).toEqual([item2])

    expect(cb).toHaveBeenCalledTimes(2)
  })
  test('Add to map - object as key - with delay', done => {
    const collection = observable(new Map())
    const cb = jest.fn().mockImplementation(() => {
      expect(cb.mock.calls[0][0]).toEqual([item1, item2])

      expect(cb).toHaveBeenCalledTimes(1)
      done()
    })
    const item1 = {
      key: { key: 1 },
      value: 'one'
    }
    const item2 = {
      key: { key: 2 },
      value: 'two'
    }

    mapAdded<number, string>(collection, cb, 10)
    collection.set(item1.key, item1.value)
    collection.set(item2.key, item2.value)
  })
  test('Add to map - runInAction', () => {
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

    mapAdded<number, string>(collection, cb)
    runInAction(() => {
      collection.set(item1.key, item1.value)
      collection.set(item2.key, item2.value)
    })

    expect(cb.mock.calls[0][0]).toEqual([item1, item2])

    expect(cb).toHaveBeenCalledTimes(1)
  })
  test('React to mobx "map.merge" method', () => {
    const collection = observable(new Map())
    const cb = jest.fn()

    mapAdded<number, string>(collection, cb)
    runInAction(() => {
      collection.merge({ who: 'Ivan', nick: 'Ikac' })
    })

    expect(cb.mock.calls[0][0]).toEqual([
      { key: 'who', value: 'Ivan' },
      { key: 'nick', value: 'Ikac' }
    ])

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

    mapAdded<number, string>(collection, cb)

    runInAction(() => {
      collection.replace({ who: 'Ivan', nick: 'Ikac' })
    })

    expect(cb.mock.calls[0][0]).toEqual([
      { key: 'who', value: 'Ivan' },
      { key: 'nick', value: 'Ikac' }
    ])

    expect(cb).toHaveBeenCalledTimes(1)
  })
  test('Throw if passed in map is not an observable map', () => {
    expect(() => {
      mapAdded(([] as unknown) as ObservableMap, jest.fn())
    }).toThrow(/Map as the first argument/)
  })
})
