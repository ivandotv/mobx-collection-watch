import {
  IArrayChange,
  IArraySplice,
  IObservableArray,
  isObservableArray,
  observable,
  observe,
  reaction,
  runInAction
} from 'mobx'
import { Callback, Dispose } from './arrayAdded'

/**
 * Monitors array for changes
 * @internal
 * @template T
 * @param observableArray
 * @param cb
 * @param delay
 * @param changeType
 * @returns array
 */
export function monitorArray<T = any>(
  observableArray: IObservableArray<T>,
  cb: Callback<T>,
  delay: number,
  changeType: 'added' | 'removed'
): Dispose {
  if (!isObservableArray(observableArray)) {
    throw new Error('Expected observable array as the first argument')
  }
  const changeFlag = observable.box({})
  const changedItems: T[] = []
  const disposeReaction = reaction(
    () => changeFlag.get(),
    () => {
      // eslint-disable-next-line
      cb([...changedItems], dispose)
      changedItems.length = 0
    },
    { delay: delay }
  )
  const disposeObserve = observe(
    observableArray,
    (change: IArrayChange<T> | IArraySplice<T>) => {
      // handleChangeFn(change, changedItems, changeFlag)
      /* istanbul ignore next */
      if (change.type === 'splice' && change[changeType].length > 0) {
        runInAction(() => {
          changedItems.push(...change[changeType])
          // mark the change
          changeFlag.set({})
        })
      }
    }
  )
  function dispose(): void {
    disposeObserve()
    disposeReaction()
  }

  return dispose
}
