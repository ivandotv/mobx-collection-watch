import { observable, runInAction, IObservableArray } from 'mobx'
import { arrayRemoved } from '../../src/array/arrayRemoved'

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

describe('arrayRemoved', () => {
  test('Throw if passed in array is not an observable', () => {
    const collection: any = ([] as unknown) as IObservableArray
    const checkItems = jest.fn()

    expect(() => {
      arrayRemoved<TestItem>(collection, checkItems)
    }).toThrow('Expected observable array as the first argument')
  })
  test('remove items', () => {
    const collection = observable<TestItem>(testItems)
    const checkItems = jest.fn()
    arrayRemoved<TestItem>(collection, checkItems)

    const item1 = collection.pop()
    const item2 = collection.pop()

    expect(checkItems.mock.calls[0][0]).toEqual([item1])
    expect(checkItems.mock.calls[1][0]).toEqual([item2])
    expect(checkItems).toBeCalledTimes(2)
  })

  test('remove new - runInAction', () => {
    const collection = observable<TestItem>(testItems)
    const checkItems = jest.fn()
    arrayRemoved<TestItem>(collection, checkItems)
    let item1
    let item2
    runInAction(() => {
      item1 = collection.pop()
      item2 = collection.pop()
    })

    expect(checkItems.mock.calls[0][0]).toEqual([item1, item2])
    expect(checkItems).toBeCalledTimes(1)
  })

  test('React to mobx "replace" method', () => {
    const collection = observable<TestItem>(testItems)
    const checkItems = jest.fn()
    arrayRemoved<TestItem>(collection, checkItems)

    collection.replace([{ id: 1 }])

    expect(checkItems.mock.calls[0][0]).toEqual(testItems)
    expect(checkItems).toBeCalledTimes(1)
  })
  test('React to mobx "clear" method', () => {
    const collection = observable<TestItem>(testItems)
    const checkItems = jest.fn()
    arrayRemoved<TestItem>(collection, checkItems)

    collection.clear()

    expect(checkItems.mock.calls[0][0]).toEqual(testItems)
    expect(checkItems).toBeCalledTimes(1)
  })
  test('React to splice method', () => {
    const collection = observable<TestItem>(testItems)
    const checkItems = jest.fn()
    arrayRemoved<TestItem>(collection, checkItems)

    const spliced = collection.splice(0, 3)

    expect(checkItems.mock.calls[0][0]).toEqual(spliced)

    expect(checkItems).toBeCalledTimes(1)
  })
  test('React to splice method - runInAction', () => {
    const collection = observable<TestItem>(testItems)
    const checkItems = jest.fn()
    arrayRemoved<TestItem>(collection, checkItems)

    let spliced1: TestItem[]
    let spliced2: TestItem[]
    runInAction(() => {
      spliced1 = collection.splice(0, 3)
      spliced2 = collection.splice(0, 3)
    })

    // @ts-ignore
    expect(checkItems.mock.calls[0][0]).toEqual(spliced1.concat(spliced2))

    expect(checkItems).toBeCalledTimes(1)
  })
  test('React with delay', done => {
    const collection = observable<TestItem>(testItems)
    const checkItems = jest.fn().mockImplementation(() => {
      expect(checkItems.mock.calls[0][0]).toEqual([item1, item2])
      expect(checkItems).toBeCalledTimes(1)
      done()
    })

    arrayRemoved<TestItem>(collection, checkItems, 10)

    const item1 = collection.shift()
    const item2 = collection.shift()
  })
  describe('Dispose', () => {
    test('Stop reaction when dispose function is called', () => {
      const collection = observable<TestItem>(testItems)
      const checkItems = jest.fn()
      const disposeFn = arrayRemoved<TestItem>(collection, checkItems)

      collection.pop()
      disposeFn()
      collection.pop()
      collection.shift()

      expect(checkItems).toBeCalledTimes(1)
    })
    test('Stop reaction when dispose function is called from inside the callback', () => {
      const collection = observable<TestItem>(testItems)
      const checkItems = jest
        .fn()
        .mockImplementation((items: TestItem[], disposeFn: () => void) => {
          disposeFn()
        })

      arrayRemoved<TestItem>(collection, checkItems)

      collection.pop()
      collection.pop()
      collection.pop()

      expect(checkItems).toBeCalledTimes(1)
    })
  })
})
