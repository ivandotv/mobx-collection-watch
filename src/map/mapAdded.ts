import {
  IMapDidChange,
  IReactionPublic,
  isObservableMap,
  observable,
  ObservableMap,
  observe,
  reaction,
  runInAction
} from 'mobx'
import { Dispose } from '../array/arrayAdded'

/* Payload for map changed item */
export interface MapChangeInfo<K = any, T = any> {
  key: K
  value: T
}
/* Payload for map updated values */
export interface MapValueUpdateInfo<K = any, T = any> {
  key: K
  newValue: T
  oldValue: T
}

/* Callback for updated map values */
export interface MapValueUpdateCb<K = any, T = any> {
  (items: MapValueUpdateInfo<K, T>[], dispose: Dispose): void
}
/* Callback for changed map values */
export interface MapChangeCb<K = any, T = any> {
  (items: MapChangeInfo<K, T>[], dispose: Dispose): void
}

/* Function for selecting which properties of the item will be used for triggering changes */
export type SelectorFn<T, K> = (item: T) => K

export type MapCallback<T, K> = (
  data: K,
  item: T,
  reaction: IReactionPublic
) => void
/**
 * Monitor the map for new elements
 * @template K
 * @template T
 * @param collection
 * @param cb function to be called
 * @param [delay] Delay in miliseconds when to run the callback on change
 * @returns Function to dispose the reaction
 */
export function mapAdded<K = any, T = any>(
  collection: ObservableMap<K, T>,
  cb: MapChangeCb<K, T>,
  delay = 0
): Dispose {
  return monitorMap(collection, cb, delay, 'add')
}

export function monitorMap<K = any, T = any>(
  collection: ObservableMap<K, T>,
  cb: MapChangeCb<K, T>,
  delay: number,
  changeType: 'add' | 'delete'
): Dispose {
  if (!isObservableMap(collection)) {
    throw new Error('Expected observable Map as the first argument')
  }
  const changeFlag = observable.box({})

  const changedItems: MapChangeInfo<K, T>[] = []

  const disposeReaction = reaction(
    () => changeFlag.get(),
    () => {
      // eslint-disable-next-line
      cb([...changedItems], dispose)
      changedItems.length = 0
    },
    { delay: delay }
  )
  const disposeObserve = observe(collection, (change: IMapDidChange) => {
    /* istanbul ignore next */
    const changeKey = changeType === 'add' ? 'newValue' : 'oldValue'
    if (change.type === changeType) {
      runInAction(() => {
        changedItems.push({
          key: change.name,
          // @ts-ignore
          value: change[changeKey]
        })
        // mark the   change
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
