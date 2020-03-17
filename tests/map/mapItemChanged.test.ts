import { observable, toJS, runInAction, ObservableMap } from 'mobx'
import { mapItemChanged } from '../../src/map/mapItemChanged'
type TestItem = {
  id: number
  name: string
}
describe('Map item changed', () => {
  test('React to item update when key is primitive (number)', () => {
    const item1 = observable({
      key: 1,
      value: {
        id: 1,
        name: 'one'
      }
    })
    const item2 = observable({
      key: {},
      value: {
        id: 2,
        name: 'two'
      }
    })
    const selectorFn = (item: TestItem): number => {
      return toJS(item).id
    }
    const cb = jest.fn()
    const collection = observable(new Map())

    collection.set(item1.key, item1.value)
    collection.set(item2.key, item2.value)

    mapItemChanged<TestItem, number>(collection, selectorFn, cb)
    item1.value.id = 5

    expect(cb.mock.calls[0][1]).toEqual(item1.value)
    expect(cb).toHaveBeenCalledTimes(1)
  })
  test('React to item update when key is object', () => {
    const item1 = observable({
      key: {},
      value: {
        id: 1,
        name: 'one'
      }
    })
    const item2 = observable({
      key: {},
      value: {
        id: 2,
        name: 'two'
      }
    })
    const selectorFn = (item: TestItem): number => {
      return toJS(item).id
    }
    const cb = jest.fn()
    const collection = observable(new Map())

    collection.set(item1.key, item1.value)
    collection.set(item2.key, item2.value)

    mapItemChanged<TestItem, number>(collection, selectorFn, cb)
    item1.value.id = 5

    expect(cb.mock.calls[0][1]).toEqual(item1.value)
    expect(cb).toHaveBeenCalledTimes(1)
  })
  test('React to updating the same item multiple times', () => {
    const item1 = observable({
      key: {},
      value: {
        id: 1,
        name: 'one'
      }
    })
    const item2 = observable({
      key: {},
      value: {
        id: 2,
        name: 'two'
      }
    })

    const selectorFn = (item: TestItem): number => {
      return toJS(item).id
    }
    const cb = jest.fn()
    const collection = observable(new Map())

    collection.set(item1.key, item1.value)
    collection.set(item2.key, item2.value)

    mapItemChanged<TestItem, number>(collection, selectorFn, cb)
    item1.value.id = 5
    item1.value.id = 6

    expect(cb.mock.calls[0][1]).toEqual(item1.value)
    expect(cb).toHaveBeenCalledTimes(2)
  })
  test('React to updating the same item multiple times - with delay', done => {
    const item1 = observable({
      key: {},
      value: {
        id: 1,
        name: 'one'
      }
    })
    const item2 = observable({
      key: {},
      value: {
        id: 2,
        name: 'two'
      }
    })

    const selectorFn = (item: TestItem): number => {
      return toJS(item).id
    }
    const cb = jest.fn().mockImplementation(() => {
      expect(cb.mock.calls[0][1]).toEqual(item1.value)
      expect(cb).toHaveBeenCalledTimes(1)
      done()
    })
    const collection = observable(new Map())

    collection.set(item1.key, item1.value)
    collection.set(item2.key, item2.value)

    mapItemChanged<TestItem, number>(collection, selectorFn, cb, {
      delay: 10
    })
    item1.value.id = 5
    item1.value.id = 6
  })
  test('React to new object when the key is replaced ', () => {
    const selectorFn = (item: TestItem): number => {
      return toJS(item).id
    }
    const cb = jest.fn()
    const collection = observable(new Map())
    const item1 = observable({
      key: {},
      value: {
        id: 1,
        name: 'one'
      }
    })
    const item2 = observable({
      key: {},
      value: {
        id: 2,
        name: 'two'
      }
    })

    mapItemChanged<TestItem, number>(collection, selectorFn, cb)
    collection.set(item1.key, item1.value)
    collection.set(item1.key, item2.value)

    item2.value.id = 5

    expect(cb.mock.calls[0][1]).toEqual({ id: 5, name: item2.value.name })
    expect(cb).toHaveBeenCalledTimes(1)
  })
  test('Stop reacting to old object when the key is updated with the new object ', () => {
    const selectorFn = (item: TestItem): number => {
      return toJS(item).id
    }
    const cb = jest.fn()
    const collection = observable(new Map())
    const item1 = observable({
      key: {
        id: 1
      },
      value: {
        id: 1,
        name: 'one'
      }
    })
    const item2 = observable({
      key: {
        key: 2
      },
      value: {
        id: 2,
        name: 'two'
      }
    })

    mapItemChanged<TestItem, number>(collection, selectorFn, cb)

    collection.set(item1.key, item1.value)
    collection.set(item1.key, item2.value)
    // update old key
    item1.value.id = 5
    expect(cb).toHaveBeenCalledTimes(0)
  })
  test('React once when updating the same item multiple times - runInAction', () => {
    const item1 = observable({
      key: {},
      value: {
        id: 1,
        name: 'one'
      }
    })

    const item2 = observable({
      key: {},
      value: {
        id: 2,
        name: 'two'
      }
    })

    const selectorFn = (item: TestItem): number => {
      return toJS(item).id
    }
    const cb = jest.fn()
    const collection = observable(new Map())

    collection.set(item1.key, item1.value)
    collection.set(item2.key, item2.value)

    mapItemChanged<TestItem, number>(collection, selectorFn, cb)
    runInAction(() => {
      item1.value.id = 5
      item1.value.id = 6
    })

    expect(cb.mock.calls[0][1]).toEqual(item1.value)
    expect(cb).toHaveBeenCalledTimes(1)
  })

  test('Fire effect function immediately for already present items in the map', () => {
    const item1 = observable({
      key: {},
      value: {
        id: 1,
        name: 'one'
      }
    })

    const item2 = observable({
      key: {},
      value: {
        id: 2,
        name: 'two'
      }
    })
    const selectorFn = (item: TestItem): number => {
      return toJS(item).id
    }
    const cb = jest.fn()
    const collection = observable(new Map())

    collection.set(item1.key, item1.value)
    collection.set(item2.key, item2.value)

    mapItemChanged<TestItem, number>(collection, selectorFn, cb, {
      fireImmediately: true
    })

    expect(cb.mock.calls[0][1]).toEqual(item1.value)
    expect(cb.mock.calls[1][1]).toEqual(item2.value)
    expect(cb).toHaveBeenCalledTimes(collection.size)
  })
  test('React to new item in the collection', () => {
    const item1 = observable({
      key: {},
      value: {
        id: 1,
        name: 'one'
      }
    })
    const selectorFn = (item: TestItem): number => {
      return toJS(item).id
    }
    const cb = jest.fn()
    const collection = observable(new Map())

    mapItemChanged<TestItem, number>(collection, selectorFn, cb)
    collection.set(item1.key, item1.value)

    runInAction(() => {
      item1.value.id = 5
    })

    expect(cb.mock.calls[0][1]).toEqual(item1.value)
    expect(cb).toHaveBeenCalledTimes(1)
  })
  test('React to new item in the collection immediately when added', () => {
    const item1 = observable({
      key: {},
      value: {
        id: 1,
        name: 'one'
      }
    })
    const selectorFn = (item: TestItem): number => {
      return toJS(item).id
    }
    const cb = jest.fn()
    const collection = observable(new Map())

    mapItemChanged<TestItem, number>(collection, selectorFn, cb, {
      fireImmediately: true
    })
    collection.set(item1.key, item1.value)

    expect(cb.mock.calls[0][1]).toEqual(item1.value)
    expect(cb).toHaveBeenCalledTimes(1)
  })
  test('If the item is removed from collection stop responding to that item updates', () => {
    const item1 = observable({
      key: {},
      value: {
        id: 1,
        name: 'one'
      }
    })
    const item2 = observable({
      key: {},
      value: {
        id: 2,
        name: 'two'
      }
    })
    const selectorFn = (item: TestItem): number => {
      return toJS(item).id
    }
    const cb = jest.fn()
    const collection = observable(new Map())
    collection.set(item1.key, item1.value)
    collection.set(item2.key, item2.value)

    mapItemChanged<TestItem, number>(collection, selectorFn, cb)
    collection.delete(item1.key)
    item1.value.id = 5
    item2.value.id = 5

    expect(cb).toHaveBeenCalledTimes(1)
  })
  test('If "dispose" method is called stop responding to all item updates', () => {
    const item1 = observable({
      key: {},
      value: {
        id: 1,
        name: 'one'
      }
    })
    const item2 = observable({
      key: {},
      value: {
        id: 2,
        name: 'two'
      }
    })
    const selectorFn = (item: TestItem): number => {
      return toJS(item).id
    }
    const cb = jest.fn()
    const collection = observable(new Map())
    collection.set(item1.key, item1.value)
    collection.set(item2.key, item2.value)

    const dispose = mapItemChanged<TestItem, number>(collection, selectorFn, cb)
    item1.value.id = 5
    dispose()
    item2.value.id = 5

    expect(cb).toHaveBeenCalledTimes(1)
  })
  test('Throw an error if passed in array is not an observable', () => {
    const collection: any = (new Map() as unknown) as ObservableMap
    const selectorFn = jest.fn()
    const cb = jest.fn()

    expect(() => {
      mapItemChanged(collection, selectorFn, cb)
    }).toThrow('Expected observable Map as the first argument')
  })
})
