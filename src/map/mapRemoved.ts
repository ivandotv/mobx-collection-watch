import { ObservableMap } from 'mobx'
import { Dispose } from '../array/arrayAdded'
import { monitorMap, MapChangeCb } from './mapAdded'

/**
 * Monitor the map for removed elements
 * @template K
 * @template T
 * @param collection
 * @param cb function to be called
 * @param [delay] Delay in miliseconds when to run the callback on change
 * @returns Function to dispose the reaction
 */
export function mapRemoved<K = any, T = any>(
  collection: ObservableMap<K, T>,
  cb: MapChangeCb<K, T>,
  delay = 0
): Dispose {
  return monitorMap(collection, cb, delay, 'delete')
}
