import { IObservableArray } from 'mobx'
import { monitorArray } from './monitorArray'

/* Function that is called to dispose the reaction */
export type Dispose = {
  (): void
}

/* Function that is called when there is a change on the collection */
export type Callback<T> = (items: T[], dispose: Dispose) => void

/**
 * Monitor the array for new elements
 * @template T
 * @param observableArray Mobx observable array
 * @param cb function to be called
 * @param [delay] Delay in miliseconds when to run the callback on change
 * @returns Function to dispose the reaction
 */
export function arrayAdded<T = any>(
  observableArray: IObservableArray<T>,
  cb: Callback<T>,
  delay = 0
): Dispose {
  return monitorArray(observableArray, cb, delay, 'added')
}
