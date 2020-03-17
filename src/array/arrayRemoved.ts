import { IObservableArray } from 'mobx'
import { Callback, Dispose } from './arrayAdded'
import { monitorArray } from './monitorArray'

/**
 * Monitor the array for removed items
 * @template T
 * @param observableArray
 * @param cb Function to be called
 * @param [delay]  Delay in miliseconds when to run the callback
 * @returns Dispose
 */
export function arrayRemoved<T = any>(
  observableArray: IObservableArray<T>,
  cb: Callback<T>,
  delay = 0
): Dispose {
  return monitorArray(observableArray, cb, delay, 'removed')
}
