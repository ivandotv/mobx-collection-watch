import { observable, configure, runInAction, IObservableArray } from 'mobx'
import { arrayReplaced } from '../../src/array/arrayReplaced'

type TestItem = {
  id: number
}

configure({
  enforceActions: 'never'
})

let testItems: TestItem[]
beforeEach(() => {
  testItems = []
  let inc = 1
  for (let i = 0; i < 10; i++) {
    testItems.push({ id: inc++ })
  }
})

describe('Replacing items', () => {
  test('Throw if passed in array is not an observable', () => {
    const collection: any = ([] as unknown) as IObservableArray
    const checkItems = jest.fn()

    expect(() => {
      arrayReplaced<TestItem>(collection, checkItems)
    }).toThrow('Expected observable array as the first argument')
  })
  test('React to replacing items', () => {
    const collection = observable(testItems)
    const checkItems = jest.fn()

    arrayReplaced(collection, checkItems)

    const newItem1 = { id: 1 }
    const newItem2 = { id: 2 }

    collection[0] = newItem1
    collection[1] = newItem2

    expect(checkItems.mock.calls[0][0]).toEqual([
      {
        index: 0,
        oldValue: testItems[0],
        newValue: newItem1
      }
    ])

    expect(checkItems.mock.calls[1][0]).toEqual([
      {
        index: 1,
        oldValue: testItems[1],
        newValue: newItem2
      }
    ])
    expect(checkItems).toBeCalledTimes(2)
  })
  test('React to replacing items - with delay', (done) => {
    const collection = observable(testItems)
    const checkItems = jest.fn().mockImplementation(() => {
      expect(checkItems.mock.calls[0][0]).toEqual([
        {
          index: 0,
          oldValue: testItems[0],
          newValue: newItem1
        },
        {
          index: 1,
          oldValue: testItems[1],
          newValue: newItem2
        }
      ])
      expect(checkItems).toBeCalledTimes(1)
      done()
    })

    arrayReplaced(collection, checkItems, 10)

    const newItem1 = { id: 1 }
    const newItem2 = { id: 2 }

    collection[0] = newItem1
    collection[1] = newItem2
  })

  test('React to replacing items - runInAction', () => {
    const collection = observable(testItems)
    const checkItems = jest.fn()

    arrayReplaced(collection, checkItems)

    const newItem1 = { id: 11 }
    const newItem2 = { id: 12 }

    runInAction(() => {
      collection[0] = newItem1
      collection[1] = newItem2
    })

    expect(checkItems.mock.calls[0][0]).toEqual([
      {
        index: 0,
        oldValue: testItems[0],
        newValue: newItem1
      },
      {
        index: 1,
        oldValue: testItems[1],
        newValue: newItem2
      }
    ])

    expect(checkItems).toBeCalledTimes(1)
  })

  test('React to replacing the same item multiple times', () => {
    const collection = observable(testItems)
    const checkItems = jest.fn()

    arrayReplaced(collection, checkItems)

    const newItem1 = { id: 1 }
    const newItem2 = { id: 2 }

    collection[0] = newItem1
    collection[0] = newItem2

    expect(checkItems.mock.calls[0][0]).toEqual([
      {
        index: 0,
        oldValue: testItems[0],
        newValue: newItem1
      }
    ])

    expect(checkItems.mock.calls[1][0]).toEqual([
      {
        index: 0,
        oldValue: testItems[0],
        newValue: newItem2
      }
    ])
    expect(checkItems).toBeCalledTimes(2)
  })

  test('React to replacing the same item multiple times - runInAction', () => {
    const collection = observable(testItems)
    const checkItems = jest.fn()

    arrayReplaced(collection, checkItems)

    const newItem1 = { id: 1 }
    const newItem2 = { id: 2 }

    runInAction(() => {
      collection[0] = newItem1
      collection[0] = newItem2
    })

    expect(checkItems.mock.calls[0][0]).toEqual([
      {
        index: 0,
        oldValue: testItems[0],
        newValue: newItem2
      }
    ])
    expect(checkItems).toBeCalledTimes(1)
  })

  describe('Dispose', () => {
    test('Stop reaction when dispose function is called', () => {
      const collection = observable<TestItem>(testItems)
      const checkItems = jest.fn()

      const disposeFn = arrayReplaced<TestItem>(collection, checkItems)

      const newItem1 = { id: 1 }
      const newItem2 = { id: 2 }

      collection[0] = newItem1
      disposeFn()
      collection[0] = newItem2

      expect(checkItems).toBeCalledTimes(1)
    })
    test('Stop reaction when dispose function is called from inside the callback', () => {
      const collection = observable<TestItem>(testItems)
      const checkItems = jest
        .fn()
        .mockImplementation((items: TestItem[], disposeFn: () => void) => {
          disposeFn()
        })

      arrayReplaced<TestItem>(collection, checkItems)

      const newItem1 = { id: 1 }
      const newItem2 = { id: 2 }

      collection[0] = newItem1
      collection[0] = newItem2

      expect(checkItems).toBeCalledTimes(1)
    })
  })
})
