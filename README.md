# abortable-generator

Abortable AsyncGenerators using AbortControllers

# Installation

```sh
npm i --save node-module-template
```

# Usage

#### Supports both ESM and CommonJS

```js
// esm
import abortable from 'abortable-generator`
// commonjs
const abortable = require('abortable-generator').default
```

#### Problem with "stuck" AsyncGenerators

There is a problem with AsyncGenerators where unsettled Promises can prevent them from finishing (and sometimes lead to memory leaks 😱)

```js
async function* getItems() {
  try {
    yield new Promise((resolve) => {})
  } finally {
    // this never happens
  }
}

const items = getItems()

setTimeout(() => {
  // some time later
  items.return()
}, 100)
for await (let item of items) {
  // this never happens
}
```

#### Abort "stuck" AsyncGenerators w/ return or throw

Here's an example of how to abort "stuck" AsyncGenerators using abortable-generator

```js
import abortable from 'abortable-generators'

// wrap your AsyncGenerators with `abortable` and use `raceAbort` inside
const getItems = abortable(async function* (raceAbort) {
  try {
    yield raceAbort(new Promise((resolve) => {}))
  } catch (err) {
    if (err.name === 'AbortError') {
      // note: abort-errors should be handled and ignored!
      return
    }
    throw err
  } finally {
    // return or throw will reach here!
  }
})
const items = getItems()

setTimeout(() => {
  // some time later
  // return will trigger an abort
  items.return()
  // throw will too and throw an error inside the generator
  items.throw(new Error('boom'))
}, 100)
for await (let item of items) {
  // generator didn't yield anything
}
```

#### Abort "stuck" AsyncGenerators w/ an AbortSignal

Here's an example of how to abort "stuck" AsyncGenerators using abortable-generator

```js
import abortable from 'abortable-generators'

const controller = new AbortController()
const signal = controller.signal

// wrap your AsyncGenerators with `abortable` and use `raceAbort` inside
const getItems = abortable(async function* (raceAbort) {
  try {
    yield raceAbort(new Promise((resolve) => {}))
  } catch (err) {
    if (err.name === 'AbortError') {
      // note: abort-errors should be handled and ignored!
      return
    }
    throw err
  } finally {
    // will reach here!
  }
})

// this signal can also be used to abort the generator!
const items = getItems(signal)

setTimeout(() => {
  // some time later
  controller.abort()
}, 100)
for await (let item of items) {
  // generator didn't yield anything
}
```

#### Abort AsyncGenerators containing cancellable Promises

Here's an example of how to abort AsyncGenerators that contain cancellable Promises (supporting AbortSignal)

```js
import abortable from 'abortable-generators'

const getItems = abortable(async function* (raceAbort) {
  try {
    yield raceAbort((signal) => fetch('https://codeshare.io', { signal }))
  } catch (err) {
    if (err.name === 'AbortError') {
      // note: abort-errors should be handled and ignored!
      return
    }
    throw err
  } finally {
    // return or throw will reach here!
  }
})
const items = getItems()

setTimeout(() => {
  // some time later
  items.return()
}, 100)
for await (let item of items) {
  // generator didn't yield anything
}
```

#### Advanced Example: Abort nested AsyncGenerators w/ multiple Promises and external AbortSignal

Here's an example of how to abort AsyncGenerators that contain cancellable Promises (supporting AbortSignal)

```js
import abortable from 'abortable-generators'

const controller = new AbortController()
const signal = controller.signal

const getMoreItems = abortable(async function* (raceAbort) {
  try {
    await raceAbort(timeoutPromise(100))
    yield raceAbort((signal) => fetch('https://codeshare.io', { signal }))
  } catch (err) {
    if (err.name === 'AbortError') {
      // note: abort-errors should be handled and ignored!
      return
    }
    throw err
  } finally {
    // return or throw will reach here!
  }
})
const getItems = abortable(async function* (raceAbort) {
  try {
    const moreItems = getMoreItems(raceAbort)
    for await (let item in moreItems) {
      yield item
    }
    await raceAbort(timeoutPromise(100))
    yield raceAbort((signal) => fetch('https://codeshare.io', { signal }))
  } catch (err) {
    if (err.name === 'AbortError') {
      // note: abort-errors should be handled and ignored!
      return
    }
    throw err
  } finally {
    // return or throw will reach here!
  }
})
// this signal can also be used to abort the generator!
const items = getItems(signal)

setTimeout(() => {
  // some time later
  items.return()
}, 100)
for await (let item of items) {
  //
}
```

# License

MIT
