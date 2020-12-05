import {
  IReactionDisposer,
  IReactionOptions,
  isObservableMap,
  ObservableMap,
  reaction
} from 'mobx'
import { mapAdded, SelectorFn, MapCallback, MapChangeInfo } from './mapAdded'
import { mapRemoved } from './mapRemoved'
import { mapReplaced } from './mapReplaced'
import { Dispose } from '../array/arrayAdded'

/**
 * Monitor the map for changed items
 * @template T
 * @template K
 * @param observableMap
 * @param selectorFn
 * @param cb
 * @param [options]
 * @returns Dispose
 */
export function mapItemChanged<T = any, K = any>(
  observableMap: ObservableMap<any, T>,
  selectorFn: SelectorFn<T, K>,
  cb: MapCallback<T, K>,
  options: IReactionOptions = {}
): Dispose {
  if (!isObservableMap(observableMap)) {
    throw new Error('Expected observable Map as the first argument')
  }

  const disposerByItem: Map<MapChangeInfo<K, any>['key'], Dispose> = new Map()
  // setup reaction to already present items
  observableMap.forEach((item: T, key: any) => {
    disposerByItem.set(
      key,
      setupItemReaction<T, K>(item, selectorFn, cb, options)
    )
  })

  const disposeAdded = mapAdded(observableMap, (items) => {
    items.forEach((item) => {
      disposerByItem.set(
        item.key,
        setupItemReaction<T, K>(item.value, selectorFn, cb, options)
      )
    })
  })

  const disposeRemoved = mapRemoved(observableMap, (removedItems) => {
    removedItems.forEach((item) => {
      // run reaction
      disposerByItem.get(item.key)!()
      disposerByItem.delete(item.key)
    })
  })
  const disposeUpdated = mapReplaced(observableMap, (items) => {
    // remove old reaction
    items.forEach((updatedItem) => {
      disposerByItem.get(updatedItem.key)!()
      // setup new reaction
      disposerByItem.set(
        updatedItem.key,
        setupItemReaction<T, K>(updatedItem.newValue, selectorFn, cb, options)
      )
    })
  })

  return () => {
    disposeUpdated()
    disposeRemoved()
    disposeAdded()
    for (const dispose of disposerByItem.values()) {
      dispose()
    }
  }
}

function setupItemReaction<T, K>(
  item: T,
  selectorFn: SelectorFn<T, K>,
  effectFn: MapCallback<T, K>,
  options: IReactionOptions = {}
): IReactionDisposer {
  return reaction(
    () => selectorFn(item),
    (selectorData, _, reaction) => effectFn(selectorData, item, reaction),
    options
  )
}
