# Mobx Collection Watch

![Codecov](https://img.shields.io/codecov/c/github/ivandotv/mobx-collection-watch)
![CI](https://github.com/ivandotv/mobx-collection-watch/workflows/CI/badge.svg)
[![semantic release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

## Install

```js
npm install mobx-collection-watch
```

## Table of Contents

- [How it works](#how-it-works)
- [Adding items](#adding-items)
- [Removing items](#removing-items)
- [Replacing items](#replacing-items)
- [Tracking changes to the items](#tracking-changes-to-the-items-in-the-collection)
- [Working with mobx actions](#working-with-mobx-actions)
- [Delayed callbacks](#delayed-callbacks)

## How it works

Monitor mobx arrays and maps for changes.
Works with [mobx enforceActions](https://mobx.js.org/refguide/api.html#enforceactions) mode.

This package is using [mobx observe](https://mobx.js.org/refguide/observe.html) to listen to changes on arrays and maps.

## Adding items

Monitor collection for new items. Every time something is added to the collection a callback will run with the new value that has been added. Replacing items at a particular array index also works.

**array**:

```ts
import { observable } from 'mobx'
import { arrayAdded } from 'mobx-collection-watch'

const collection = observable([])

const dispose = arrayAdded(collection, (items, disposer) => {
  // items is array of newl
  items.forEach((item) => {
    console.log(`added ${item}`) // 1,2,3
  })

  // stop responding to new items from inside the callback
  disposer()
})

collection.push(1, 2, 3)

// this will also work
collection[3] = 4

//stop responding for new items
dispose()
```

**map**:

```js
import { observable } from 'mobx'
import { mapAdded } from 'mobx-collection-watch'

const collection = observable(new Map())

//callback
const cb = function (items, dispose) {
  items.forEach((item) => {
    console.log(item) // {key:'a',value:'one'} , {key:'b',value:'two'}
  })

  //run dispose if you want to stop tracking
  dispose()
}

const dispose = mapAdded(collection, cb)

collection.set('a', 'one')
collection.set('b', 'two')
```

## Removing items

Every time something is removed from the collection a callback will run with the value that has been removed.

**array**:
Replacing items at a particular array index **will not trigger the callback**.

```ts
import { observable } from 'mobx'
import { arrayRemoved } from 'mobx-collection-watch'

const collection = observable([1, 2, 3, 4])

const dispose = arrayRemoved(collection, (items, disposer) => {
  // items is array of newl
  items.forEach((item) => {
    console.log(`removed ${item}`)
  })

  // stop responding to removed items from inside the callback
  disposer()
})

collection.pop() // trigger callback with [4]
collection.splice(0, 2) //trigger callback with [1,2]

// NOTE: this will not work!
collection[0] = 5
//stop responding for new items
dispose()
```

**map**:
Maps interface works nearly the same as the array interface. The only difference is that when there is a change
the payload will be the map **key** and the **value** as opposed to only the **value** in case of arrays.

```js
import { observable } from 'mobx'
import { mapRemoved } from 'mobx-collection-watch'

const collection = observable(
  new Map([
    ['a', 'one'],
    ['b', 'two']
  ])
)

//callback
const cb = function (items, dispose) {
  items.forEach((item) => {
    console.log(item) // {key:'a',value:'one'} , {key:'b',value:'two'}
  })

  //run dispose if you want to stop tracking
  dispose()
}

const dispose = mapRemoved(collection, cb)

collection.clear()
```

## Replacing items

You can track which items in the collection have been replaced.

**array**:
Please note that this is one to one tracking of new and replaced items, so it only works when items in the array are replaced directly by index `collection[0]=newItem`

This **will not trigger the callback**: `collection.splice(0,1,newItem)`
The callback will receive an array with objects that represent the data for every replaced element:

```js
// index at 0 which holds the value 1 was replaced with the value 3
;[
  {
    index: 0,
    oldValue: 1,
    newValue: 3
  }
]
```

```js
import { observable } from 'mobx'
import { arrayReplaced } from 'mobx-collection-watch'

const collection = observable([1, 2, 3, 4])
const cb = function () {}

const dispose = arrayReplaced(collection, (replacedData, disposer) => {
  replacedData.forEach((data) => {
    console.log(data) // e.g. {index:0, oldValue:1,newValue:3}
  })
})

collection[0] = 3 // {index:0, oldValue:1,newValue:3}
collection[1] = 4 // {index:1 oldValue:2,newValue:4}

//stop responding to new replacements
dispose()
```

**map**:
Map replacement payload callback data:

```js
// map key 'foo' which holds the value 1 is replaced with value 2
;[
  {
    key: 'foo,
    oldValue: 1,
    newValue: 2
  }
]
```

```js
import { observable, runInAction } from 'mobx'
import { mapReplaced } from 'mobx-collection-watch'

const collection = observable(
  new Map([
    ['a', 'one'],
    ['b', 'two']
  ])
)

//callback
const cb = function (items, dispose) {
  items.forEach((item) => {
    console.log(item) // {key:'a',oldValue:'one',newValue:'foo'} , {key:'b',oldValue:'two',newValue:'bar'}
  })

  //run dispose if you want to stop tracking
  dispose()
}

const dispose = mapUpdated(collection, cb)

runInAction(() => {
  collection.set('a', 'foo')
  collection.set('b', 'bar')
})
```

## Tracking changes to the items in the collection

This functionality enables you to track changes to the items in the collection **not the collection itself**.
Every time the item is added to the collection you can start tracking changes to that item. So you are not tracking what get's added or removed from the collection, rather you are tracking individual item changes that are in the collection. And when the item is removed from the collection, tracking for that item will stop. Under the hood it uses [mobx reaction()](https://mobx.js.org/refguide/reaction.html)

**array**:

```js
import { observable, toJS } from 'mobx'
import { arrayItemChanged } from 'mobx-collection-watch'

const item1 = { id: 1, name: 'Ann' }
const item2 = { id: 2, name: 'Jenna' }

const collection = observable([item1, item2])

//function that determines what properties are tracked.
//everything accessed inside the function will be tracked.
const selectorFn = (item) => {
  return toJS(item) // monitor all properties
  //or
  // monitor only the name
  return items.name // this will be the "data" prop in cb()
}

// callback will be triggered when any properties accessed inside the selectorFn function change
const cb = (data, item, reaction) => {
  // data is what is returned from the selectorFn
  console.log(`data ${data}`) // item.name
  console.log(`item changed ${item}`) // item that has changed
  //if you want to stop the reaction for that particular item
  reaction.dispose()
}

const options = {} // options is directly passed to the mobx reaction() options

const dispose = arrayItemChanged(collection, selectorFn, cb, options)

// stop tracking all items.
dispose()
```

**map**:

```js
import { observable, runInAction } from 'mobx'
import { mapItemChanged } from 'mobx-collection-watch'

// add observable items
const item1 = observable({
  value: {
    id: 1,
    name: 'one'
  }
})

//callback
const cb = function (data, item, reaction) {
  console.log(data) //5
  console.log(item) // item2

  //run dispose if you want to stop tracking
  reaction.dispose()
}

const collection = observable(new Map())
collection.set('a', item1)

//change item1
item1.value.id = 5
```

## Working with mobx actions

When working with mobx actions, using for example [runInAction](https://mobx.js.org/best/actions.html#the-runinaction-utility).
All modifications to the collection are batched. In the next example, _callback_ function will be triggered only once.

```ts
// ...code

runInAction(() => {
  collection.push(1)
  collection.push(2)
  collection.push(3, 4)
})

//callback will be triggered once with [1,2,3,4]
```

## Delayed callbacks

The callback can be called with a `delay`, when that happens all changes to the collection are batched (similar to how `runInAction` works).
Delay is supported by all collection functions.

The next example is tracking additions to the array with a delay of `100ms`, and it will be triggered only once.
Notice that we are not running inside `mobx actions`

```ts
import { observable } from 'mobx'
import { arrayAdded } from 'mobx-collection-watch'

const collection = observable([])
const cb = (items, disposer) => {
  items.forEach((item) => {
    console.log(`added ${item}`)
  })
}

//callback will be triggered only once with [1,2,3,4,5]
const dispose = arrayAdded(collection, cb, 100)

collection.push(1)
collection.push(2)
collection.push(3, 4, 5)
```
