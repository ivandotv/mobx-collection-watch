import {
  IMapDidChange,
  isObservableMap,
  observable,
  ObservableMap,
  observe,
  reaction,
  runInAction
} from 'mobx'
import { Dispose } from '../array/arrayAdded'
import { MapValueUpdateCb, MapValueUpdateInfo } from '..'

/**
 * Monitor the map for updated elements
 * @template K
 * @template T
 * @param collection
 * @param cb function to be called
 * @param [delay] Delay in miliseconds when to run the callback on change
 * @returns Function to dispose the reaction
 */
export function mapReplaced<K = any, T = any>(
  collection: ObservableMap<K, T>,
  cb: MapValueUpdateCb<K, T>,
  delay = 0
): Dispose {
  if (!isObservableMap(collection)) {
    throw new Error('Expected observable Map as the first argument')
  }
  const changeFlag = observable.box({})

  const replaced: Map<K, MapValueUpdateInfo<K, T>> = new Map()

  const disposeReaction = reaction(
    () => changeFlag.get(),
    () => {
      // eslint-disable-next-line
      cb([...replaced.values()], dispose)
      replaced.clear()
    },
    { delay: delay }
  )
  const disposeObserve = observe(collection, (change: IMapDidChange) => {
    /* istanbul ignore next */
    if (change.type === 'update') {
      runInAction(() => {
        // setup item for the first time
        if (!replaced.get(change.name)) {
          replaced.set(change.name, {
            key: change.name,
            newValue: change.newValue,
            oldValue: change.oldValue
          })
        } else {
          replaced.set(change.name, {
            oldValue: replaced.get(change.name)!.oldValue,
            newValue: change.newValue,
            key: change.name
          })
        }
        changeFlag.set({})
      })
    }
  })

  function dispose(): void {
    disposeObserve()
    disposeReaction()
  }

  return dispose
}
