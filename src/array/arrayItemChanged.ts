import {
  IObservableArray,
  IReactionDisposer,
  IReactionOptions,
  isObservableArray,
  reaction
} from 'mobx'
import { arrayAdded, Dispose } from './arrayAdded'
import { arrayRemoved } from './arrayRemoved'
import { arrayReplaced, ReplacedItemData } from './arrayReplaced'
import { SelectorFn, MapCallback } from '../map/mapAdded'

/**
 * Monitor all items in the array and run callback function when their observable properties change
 * @template T
 * @template K
 * @param observableArray
 * @param selectorFn
 * @param cb
 * @param [options]
 * @returns Dispose
 */
export function arrayItemChanged<T = any, K = any>(
  observableArray: IObservableArray<T>,
  selectorFn: SelectorFn<T, K>,
  cb: MapCallback<T, K>,
  options: IReactionOptions = {}
): Dispose {
  if (!isObservableArray(observableArray)) {
    throw new Error('Expected observable array as the first argument')
  }

  const disposerByItem: Map<
    ReplacedItemData<T>['oldValue'],
    Dispose
  > = new Map()
  // setup reaction to already present items
  observableArray.forEach((item: T) => {
    disposerByItem.set(item, setupItemReaction(item, selectorFn, cb, options))
  })

  const disposeReplaced = arrayReplaced(observableArray, (replacedItems) => {
    // remove old reaction
    replacedItems.forEach((replaced) => {
      disposerByItem.get(replaced.oldValue)!()
      disposerByItem.delete(replaced.oldValue)
      // setup new reaction
      disposerByItem.set(
        replaced.newValue,
        setupItemReaction(replaced.newValue, selectorFn, cb, options)
      )
    })
  })

  const disposeRemoved = arrayRemoved(observableArray, (items: T[]) => {
    items.forEach((item) => {
      // run reaction
      disposerByItem.get(item)!()
      disposerByItem.delete(item)
    })
  })

  const disposeAdded = arrayAdded(observableArray, (items: T[]) => {
    items.forEach((item) => {
      disposerByItem.set(item, setupItemReaction(item, selectorFn, cb, options))
    })
  })

  return () => {
    disposeReplaced()
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
