import { observable, runInAction, ObservableMap } from 'mobx'
import { mapUpdated } from '../../src/map/mapUpdated'

describe('Map Updated', () => {
  test('Update map primitive key (number)', () => {
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
    const item1Update = 'newValue'
    const item2Update = 'newValue2'
    collection.set(item1.key, item1.value)
    collection.set(item2.key, item2.value)

    mapUpdated<number, string>(collection, cb)
    collection.set(item1.key, item1Update)
    collection.set(item2.key, item2Update)

    expect(cb.mock.calls[0][0]).toEqual([
      { key: item1.key, oldValue: item1.value, newValue: item1Update }
    ])
    expect(cb.mock.calls[1][0]).toEqual([
      { key: item2.key, oldValue: item2.value, newValue: item2Update }
    ])

    expect(cb).toHaveBeenCalledTimes(2)
  })

  test('Update to map - object as key', () => {
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
    collection.set(item1.key, item1.value)
    collection.set(item2.key, item2.value)
    const item1Update = 'newValue'
    const item2Update = 'newValue2'

    mapUpdated<number, string>(collection, cb)
    collection.set(item1.key, item1Update)
    collection.set(item2.key, item2Update)

    expect(cb.mock.calls[0][0]).toEqual([
      { key: item1.key, oldValue: item1.value, newValue: item1Update }
    ])
    expect(cb.mock.calls[1][0]).toEqual([
      { key: item2.key, oldValue: item2.value, newValue: item2Update }
    ])

    expect(cb).toHaveBeenCalledTimes(2)
  })
  test('Update to map - object as key - with delay', delay => {
    const collection = observable(new Map())
    const cb = jest.fn().mockImplementation(() => {
      expect(cb.mock.calls[0][0]).toEqual([
        { key: item1.key, oldValue: item1.value, newValue: item1Update },
        { key: item2.key, oldValue: item2.value, newValue: item2Update }
      ])

      expect(cb).toHaveBeenCalledTimes(1)
      delay()
    })
    const item1 = {
      key: { key: 1 },
      value: 'one'
    }
    const item2 = {
      key: { key: 2 },
      value: 'two'
    }
    collection.set(item1.key, item1.value)
    collection.set(item2.key, item2.value)
    const item1Update = 'newValue'
    const item2Update = 'newValue2'

    mapUpdated<number, string>(collection, cb, 10)
    collection.set(item1.key, item1Update)
    collection.set(item2.key, item2Update)
  })
  test('Update map - runInAction', () => {
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

    const item1Update = 'newValue'
    const item2Update = 'newValue2'
    collection.set(item1.key, item1.value)
    collection.set(item2.key, item2.value)

    mapUpdated<number, string>(collection, cb)

    runInAction(() => {
      collection.set(item1.key, item1Update)
      collection.set(item2.key, item2Update)
    })

    expect(cb.mock.calls[0][0]).toEqual([
      { key: item1.key, oldValue: item1.value, newValue: item1Update },

      { key: item2.key, oldValue: item2.value, newValue: item2Update }
    ])

    expect(cb).toHaveBeenCalledTimes(1)
  })
  test('Update same key twice', () => {
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
    const item1Update = 'newValue'
    const item2Update = 'newValue2'
    collection.set(item1.key, item1.value)
    collection.set(item2.key, item2.value)

    mapUpdated<number, string>(collection, cb)
    collection.set(item1.key, item1Update)
    collection.set(item1.key, item2Update)

    expect(cb.mock.calls[0][0]).toEqual([
      { key: item1.key, oldValue: item1.value, newValue: item1Update }
    ])
    expect(cb.mock.calls[1][0]).toEqual([
      { key: item1.key, oldValue: item1Update, newValue: item2Update }
    ])
    expect(cb).toHaveBeenCalledTimes(2)
  })
  test('Update same key twice - runInAction', () => {
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
    const item1Update = 'newValue'
    const item2Update = 'newValue2'
    collection.set(item1.key, item1.value)
    collection.set(item2.key, item2.value)

    mapUpdated<number, string>(collection, cb)

    runInAction(() => {
      collection.set(item1.key, item1Update)
      collection.set(item1.key, item2Update)
    })

    expect(cb.mock.calls[0][0]).toEqual([
      { key: item1.key, oldValue: item1.value, newValue: item2Update }
    ])

    expect(cb).toHaveBeenCalledTimes(1)
  })
  test('React to mobx "map.merge" method', () => {
    const collection = observable(new Map())
    const cb = jest.fn()

    const item1 = {
      key: '1',
      value: 'one'
    }
    const item2 = {
      key: '2',
      value: 'two'
    }
    const item1Update = 'newValue'
    const item2Update = 'newValue2'
    collection.set(item1.key, item1.value)
    collection.set(item2.key, item2.value)

    mapUpdated<number, string>(collection, cb)
    collection.merge({
      [item1.key]: item1Update,
      [item2.key]: item2Update
    })

    expect(cb.mock.calls[0][0]).toEqual([
      { key: item1.key, oldValue: item1.value, newValue: item1Update },
      { key: item2.key, oldValue: item2.value, newValue: item2Update }
    ])
    expect(cb).toHaveBeenCalledTimes(1)
  })
  test('React to mobx "map.merge" method - runInAction', () => {
    const collection = observable(new Map())
    const cb = jest.fn()

    const item1 = {
      key: '1',
      value: 'one'
    }
    const item2 = {
      key: '2',
      value: 'two'
    }
    const item1Update = 'newValue'
    const item2Update = 'newValue2'
    collection.set(item1.key, item1.value)
    collection.set(item2.key, item2.value)

    mapUpdated<number, string>(collection, cb)

    const item1IntermediateUpdate = 'intermediate'
    runInAction(() => {
      collection.merge({
        [item1.key]: item1IntermediateUpdate,
        [item1.key]: item1Update,
        [item2.key]: item2Update
      })
    })

    expect(cb.mock.calls[0][0]).toEqual([
      { key: item1.key, oldValue: item1.value, newValue: item1Update },
      { key: item2.key, oldValue: item2.value, newValue: item2Update }
    ])

    expect(cb).toHaveBeenCalledTimes(1)
  })
  test('Throw if passed in map is not an observable map', () => {
    expect(() => {
      mapUpdated(([] as unknown) as ObservableMap, jest.fn())
    }).toThrow(/Map as the first argument/)
  })
  test('Stop reacting when dispose callback is called', () => {
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
    collection.set(item1.key, item1.value)
    collection.set(item2.key, item2.value)
    const item1Update = 'newValue'
    const item2Update = 'newValue2'

    const dispose = mapUpdated<number, string>(collection, cb)
    collection.set(item1.key, item1Update)
    dispose()
    collection.set(item2.key, item2Update)

    expect(cb).toHaveBeenCalledTimes(1)
  })
})
