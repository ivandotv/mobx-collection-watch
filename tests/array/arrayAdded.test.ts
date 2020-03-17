import { observable, runInAction, IObservableArray } from 'mobx'
import { arrayAdded } from '../../src/array/arrayAdded'

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

describe('Respond to adding Items ', () => {
  test('Throw if passed in array is not an observable', () => {
    const collection: any = ([] as unknown) as IObservableArray
    const cb = jest.fn()

    expect(() => {
      arrayAdded<TestItem>(collection, cb)
    }).toThrow('Expected observable array as the first argument')
  })
  test('Add items sequentially', () => {
    const collection = observable<TestItem>([])
    const cb = jest.fn()

    arrayAdded<TestItem>(collection, cb)
    collection.push({ id: 1 })
    collection.push({ id: 2 })

    expect(cb.mock.calls[0][0]).toEqual([{ id: 1 }])
    expect(cb.mock.calls[1][0]).toEqual([{ id: 2 }])
    expect(cb).toBeCalledTimes(2)
  })

  test('React to pushing multiple items', () => {
    const collection = observable<TestItem>([])

    const cb = jest.fn()

    arrayAdded<TestItem>(collection, cb)
    collection.push(...testItems)

    expect(cb.mock.calls[0][0]).toEqual(collection)
    expect(cb).toBeCalledTimes(1)
  })

  test('React to initial addition of items - runInAction', () => {
    const collection = observable<TestItem>([])

    const cb = jest.fn()

    arrayAdded<TestItem>(collection, cb)

    runInAction(() => {
      collection.push(...testItems)
    })

    expect(cb.mock.calls[0][0]).toEqual(collection)
    expect(cb).toBeCalledTimes(1)
  })

  test('React to mobx "replace" method', () => {
    const collection = observable<TestItem>([])

    const cb = jest.fn()

    arrayAdded<TestItem>(collection, cb)
    const replacement = [{ id: 1 }, { id: 2 }]
    collection.replace(replacement)

    expect(cb.mock.calls[0][0]).toEqual(replacement)
    expect(cb).toBeCalledTimes(1)
  })

  test('React to replacing the item at index', () => {
    const collection = observable<TestItem>([])
    const cb = jest.fn()

    arrayAdded<TestItem>(collection, cb)
    const replacement = { id: 1 }
    collection[0] = replacement

    expect(cb.mock.calls[0][0]).toEqual([replacement])
    expect(cb).toBeCalledTimes(1)
  })

  test('React to splice method', () => {
    const collection = observable<TestItem>(testItems)
    const cb = jest.fn()
    arrayAdded<TestItem>(collection, cb)

    const newItem1 = { id: 1 }
    const newItem2 = { id: 2 }

    collection.splice(0, 3, newItem1, newItem2)

    expect(cb.mock.calls[0][0]).toEqual([newItem1, newItem2])

    expect(cb).toBeCalledTimes(1)
  })
  test('React to splice method - runInAction', () => {
    const collection = observable<TestItem>(testItems)
    const cb = jest.fn()
    arrayAdded<TestItem>(collection, cb)

    const newItem1 = { id: 1 }
    const newItem2 = { id: 2 }
    runInAction(() => {
      collection.splice(0, 3, newItem1)
      collection.splice(0, 3, newItem2)
    })

    expect(cb.mock.calls[0][0]).toEqual([newItem1, newItem2])

    expect(cb).toBeCalledTimes(1)
  })
  test('React to adding new items', () => {
    const collection = observable<TestItem>([])
    const cb = jest.fn()
    const newItem1 = { id: 11 }
    const newItem2 = { id: 12 }
    arrayAdded<TestItem>(collection, cb)

    collection.push(newItem1, newItem2)

    expect(cb.mock.calls[0][0]).toEqual([newItem1, newItem2])
    expect(cb).toBeCalledTimes(1)
  })

  test('React to adding new items - runInAction', () => {
    const collection = observable<TestItem>([])
    const cb = jest.fn()
    const newItem1 = { id: 11 }
    const newItem2 = { id: 12 }
    arrayAdded<TestItem>(collection, cb)

    runInAction(() => {
      collection.push(newItem1, newItem2)
    })

    expect(cb.mock.calls[0][0]).toEqual([newItem1, newItem2])
    expect(cb).toBeCalledTimes(1)
  })
  test('React to adding new items - with delay', done => {
    const collection = observable<TestItem>([])
    const cb = jest.fn().mockImplementation(() => {
      expect(cb.mock.calls[0][0]).toEqual([
        newItem1,
        newItem2,
        newItem3,
        newItem4
      ])
      expect(cb).toBeCalledTimes(1)
      done()
    })
    const newItem1 = { id: 1 }
    const newItem2 = { id: 2 }
    const newItem3 = { id: 3 }
    const newItem4 = { id: 4 }
    arrayAdded<TestItem>(collection, cb, 10)

    collection.push(newItem1)
    collection.push(newItem2)
    collection.push(newItem3)
    collection.push(newItem4)
  })
  describe('Dispose', () => {
    test('Stop reaction when dispose function is called', () => {
      const collection = observable<TestItem>([])
      const cb = jest.fn()
      const disposeFn = arrayAdded<TestItem>(collection, cb)

      collection.push({ id: 1 })
      disposeFn()
      collection.push({ id: 1 })
      collection.push({ id: 1 })

      expect(cb).toBeCalledTimes(1)
    })
    test('Stop reaction when dispose function is called from inside the callback', () => {
      const collection = observable<TestItem>([])
      const cb = jest
        .fn()
        .mockImplementation((items: TestItem[], disposeFn: () => void) => {
          disposeFn()
        })

      arrayAdded<TestItem>(collection, cb)
      collection.push({ id: 1 })
      collection.push({ id: 1 })
      collection.push({ id: 1 })

      expect(cb).toBeCalledTimes(1)
    })
  })
})
