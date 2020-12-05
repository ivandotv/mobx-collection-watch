import {
  observable,
  configure,
  runInAction,
  toJS,
  IObservableArray
} from 'mobx'
import { arrayItemChanged } from '../../src/array/arrayItemChanged'

configure({
  enforceActions: 'never'
})

type TestItem = {
  id: number
}
let testItems: TestItem[]
beforeEach(() => {
  testItems = []
  let inc = 1
  for (let i = 0; i < 10; i++) {
    testItems.push({ id: inc++ })
  }
})

describe('arrayChangedItem', () => {
  let testItems: TestItem[]
  beforeEach(() => {
    testItems = []
    let inc = 1
    for (let i = 0; i < 10; i++) {
      testItems.push({ id: inc++ })
    }
  })

  test('React to already present items in the collection', () => {
    const selectorFn = (item: TestItem): number => {
      return toJS(item).id
    }
    const cb = jest.fn()

    const collection = observable(testItems)
    arrayItemChanged(collection, selectorFn, cb, {
      fireImmediately: true
    })

    expect(cb.mock.calls[0][0]).toBe(collection[0].id)
    expect(cb.mock.calls[collection.length - 1][0]).toBe(
      collection[collection.length - 1].id
    )
    expect(cb).toBeCalledTimes(collection.length)
  })

  test('Do not react to "replace" method of the observable array', () => {
    const selectorFn = (item: TestItem): number => {
      return toJS(item).id
    }
    const cb = jest.fn()
    const collection = observable([{ id: 123 }])

    arrayItemChanged(collection, selectorFn, cb)
    collection.replace(testItems)

    expect(cb).not.toBeCalled()
  })
  test('React to item added via "replace" method of the observable array', () => {
    const selectorFn = (item: TestItem): number => {
      return toJS(item).id
    }
    const cb = jest.fn()
    const collection = observable(testItems)
    arrayItemChanged(collection, selectorFn, cb)
    const newItem = observable({ id: 1 })

    collection.replace([newItem])
    newItem.id = 2

    expect(cb).toBeCalledTimes(1)
  })
  test('React to item update', () => {
    const selectorFn = (item: TestItem): number => {
      return toJS(item).id
    }
    const cb = jest.fn()
    const collection = observable(testItems)
    arrayItemChanged(collection, selectorFn, cb)
    collection[0].id = 3

    expect(cb.mock.calls[0][0]).toBe(collection[0].id)
    expect(cb.mock.calls[0][1]).toBe(collection[0])
    expect(cb).toBeCalledTimes(1)
  })
  test('React to item update - runInAction', () => {
    const selectorFn = (item: TestItem): number => {
      return toJS(item).id
    }
    const cb = jest.fn()
    const collection = observable(testItems)
    arrayItemChanged(collection, selectorFn, cb)
    runInAction(() => {
      collection[0].id = 3
    })

    expect(cb.mock.calls[0][0]).toBe(collection[0].id)
    expect(cb.mock.calls[0][1]).toBe(collection[0])
    expect(cb).toBeCalledTimes(1)
  })
  test('React to replaced (new item) the item in the collection', () => {
    const selectorFn = (item: TestItem): number => {
      return toJS(item).id
    }
    const cb = jest.fn()
    const collection = observable(testItems)
    arrayItemChanged(collection, selectorFn, cb)

    const newItem = { id: 11 }

    collection[0] = newItem
    collection[0].id = 12

    expect(cb.mock.calls[0][0]).toBe(collection[0].id)
    expect(cb.mock.calls[0][1]).toBe(collection[0])
    expect(cb).toBeCalledTimes(1)
  })
  test('React to replaced (new item) the item in the collection - runInAction', () => {
    const selectorFn = (item: TestItem): number => {
      return toJS(item).id
    }
    const cb = jest.fn()
    const collection = observable(testItems)
    arrayItemChanged(collection, selectorFn, cb)
    const newItem = { id: 11 }

    runInAction(() => {
      collection[0] = newItem
    })
    runInAction(() => {
      collection[0].id = 12
    })

    expect(cb.mock.calls[0][0]).toBe(collection[0].id)
    expect(cb.mock.calls[0][1]).toBe(collection[0])
    expect(cb).toBeCalledTimes(1)
  })
  test('React to updating newly added item', () => {
    const selectorFn = (item: TestItem): number => {
      return toJS(item).id
    }
    const cb = jest.fn()
    const collection = observable(testItems)
    arrayItemChanged(collection, selectorFn, cb)
    const newItem = { id: 11 }

    const newLength = collection.push(newItem)
    collection[newLength - 1].id = 12

    expect(cb.mock.calls[0][0]).toBe(collection[newLength - 1].id)
    expect(cb.mock.calls[0][1]).toBe(collection[newLength - 1])
    expect(cb).toBeCalledTimes(1)
  })
  test('React to newly added item - runInAction', () => {
    const selectorFn = (item: TestItem): number => {
      return toJS(item).id
    }
    const cb = jest.fn()
    const collection = observable(testItems)
    arrayItemChanged(collection, selectorFn, cb)
    const newItem = { id: 11 }
    let newLength: number = 0

    runInAction(() => {
      newLength = collection.push(newItem)
    })
    runInAction(() => {
      collection[newLength - 1].id = 12
    })

    expect(cb.mock.calls[0][0]).toBe(collection[newLength - 1].id)
    expect(cb.mock.calls[0][1]).toBe(collection[newLength - 1])
    expect(cb).toBeCalledTimes(1)
  })
  test('React to updating item multiple times', () => {
    const selectorFn = (item: TestItem): number => {
      return toJS(item).id
    }
    const cb = jest.fn()
    const collection = observable(testItems)
    arrayItemChanged(collection, selectorFn, cb)

    const change1 = 10
    const change2 = 11
    const change3 = 12

    collection[0].id = change1
    collection[0].id = change2
    collection[0].id = change3

    expect(cb.mock.calls[0][0]).toBe(change1)
    expect(cb.mock.calls[1][0]).toBe(change2)
    expect(cb.mock.calls[2][0]).toBe(change3)
    expect(cb).toBeCalledTimes(3)
  })
  test('React to updating item multiple times - with delay', (done) => {
    const selectorFn = (item: TestItem): number => {
      return toJS(item).id
    }
    const cb = jest.fn().mockImplementation(() => {
      expect(cb.mock.calls[0][0]).toBe(change3)
      // expect(cb.mock.calls[1][0]).toBe(change2)
      // expect(cb.mock.calls[2][0]).toBe(change3)
      expect(cb).toBeCalledTimes(1)
      done()
    })
    const collection = observable(testItems)
    arrayItemChanged(collection, selectorFn, cb, { delay: 10 })

    const change1 = 10
    const change2 = 11
    const change3 = 12

    collection[0].id = change1
    collection[0].id = change2
    collection[0].id = change3
  })

  test('If the item is removed from the collection stop reacting to it', () => {
    const selectorFn = (item: TestItem): number => {
      return toJS(item).id
    }
    const cb = jest.fn()

    const collection = observable(testItems)

    arrayItemChanged(collection, selectorFn, cb)
    collection[0].id = 2
    const removedItem = collection.pop()
    removedItem!.id = 3
    removedItem!.id = 4

    expect(cb).toBeCalledTimes(1)
  })
  test('If the item is removed from the collection stop reacting to it - runInAction', () => {
    const selectorFn = (item: TestItem): number => {
      return toJS(item).id
    }

    const cb = jest.fn()
    const collection = observable(testItems)
    let removedItem: any
    arrayItemChanged(collection, selectorFn, cb)

    runInAction(() => {
      removedItem! = collection.pop()
    })
    runInAction(() => {
      removedItem!.id = 3
      removedItem!.id = 4
    })

    expect(cb).toBeCalledTimes(0)
  })

  test('If "dispose" method is called, stop reacting to all updates', () => {
    const selectorFn = (item: TestItem): number => {
      return toJS(item).id
    }
    const cb = jest.fn()

    const collection = observable(testItems)
    const itemChangeDispose = arrayItemChanged(collection, selectorFn, cb)

    collection[0].id = 123
    itemChangeDispose()
    collection[1].id = 123

    expect(cb).toBeCalledTimes(1)
  })

  test('If "dispose" method is called on the item in the collection, stop reacting to that item only.', () => {
    const selectorFn = (item: TestItem): number => {
      return toJS(item).id
    }
    const cb = jest.fn((_data, _item, reaction) => {
      reaction.dispose()
    })

    const collection = observable(testItems)
    arrayItemChanged(collection, selectorFn, cb)

    collection[0].id = 123
    collection[0].id = 124
    collection[0].id = 125

    expect(cb).toBeCalledTimes(1)
  })

  test('If collection "dispose" method is called, stop all reactions - runInAction', () => {
    const selectorFn = (item: TestItem): number => {
      return toJS(item).id
    }
    const cb = jest.fn()

    const collection = observable(testItems)
    const itemChangeDispose = arrayItemChanged(collection, selectorFn, cb)

    itemChangeDispose()
    runInAction(() => {
      collection[0].id = 123
      collection[1].id = 123
      collection[3].id = 123
    })

    expect(cb).toBeCalledTimes(0)
  })
  test('Throw an error if passed in array is not an observable', () => {
    const collection: any = ([] as unknown) as IObservableArray
    const selectorFn = jest.fn()
    const cb = jest.fn()

    expect(() => {
      arrayItemChanged(collection, selectorFn, cb)
    }).toThrow('Expected observable array as the first argument')
  })
})
