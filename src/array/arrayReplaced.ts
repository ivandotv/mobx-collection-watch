import {
  IArrayChange,
  IArraySplice,
  IObservableArray,
  observable,
  observe,
  reaction,
  runInAction,
  isObservableArray
} from 'mobx'
import { Dispose } from './arrayAdded'

export type ReplacedItemData<T> = {
  index: number
  oldValue: T
  newValue: T
}

export type ReplacedItemCallback<T> = (
  data: ReplacedItemData<T>[],
  dispose: Dispose
) => void

/**
 * Monitor the array for replaced elements
 * @template T
 * @param observableArray
 * @param cb function to be called
 * @param [delay] Delay in miliseconds when to run the callback on change
 * @returns Function to dispose the reaction
 */
export function arrayReplaced<T = any>(
  observableArray: IObservableArray<T>,
  cb: ReplacedItemCallback<T>,
  delay = 0
): Dispose {
  if (!isObservableArray(observableArray)) {
    throw new Error('Expected observable array as the first argument')
  }

  let replaced: { [key: number]: ReplacedItemData<T> } = {}
  const changeFlag = observable.box({})
  const disposeReaction = reaction(
    () => changeFlag.get(),
    () => {
      cb(Object.values(replaced), dispose)
      replaced = {}
    },
    { delay: delay }
  )

  const disposeObserve = observe(
    observableArray,
    (change: IArrayChange<T> | IArraySplice<T>) => {
      /* istanbul ignore next */
      if (change.type === 'update') {
        runInAction(() => {
          if (!replaced[change.index]) {
            replaced[change.index] = {
              oldValue: change.oldValue,
              newValue: change.newValue,
              index: change.index
            }
          } else {
            replaced[change.index] = {
              oldValue: replaced[change.index].oldValue,
              newValue: change.newValue,
              index: change.index
            }
          }

          changeFlag.set({})
        })
      }
    }
  )

  function dispose(): void {
    disposeReaction()
    disposeObserve()
  }

  return dispose
}
