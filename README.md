# abortable-generator

Abortable AsyncGenerators using AbortControllers

# Installation

```sh
npm i --save node-module-template
```

# Usage

### Supports both ESM and CommonJS

```js
// esm
import abortable from 'abortable-generator`
// commonjs
const abortable = require('abortable-generator').default
```

### Problem with "stuck" AsyncGenerators

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

### Abort "stuck" AsyncGenerators w/ return

Here's an example of how to abort "stuck" AsyncGenerators using abortable-generator

```js
import abortable from 'abortable-generators'

// wrap your AsyncGenerators with `abortable` and use `raceAbort` inside
const getItems = abortable(async function* (raceAbort) {
  yield raceAbort(new Promise((resolve) => {}))
})
const items = getItems()

setTimeout(() => {
  // some time later
  // return will trigger an abort
  items.return()
}, 100)
for await (let item of items) {
  // generator didn't yield anything
}
```

### Abort "stuck" AsyncGenerators w/ return with try...catch...finally

Here's an example of how to abort "stuck" AsyncGenerators using abortable-generator

```js
import abortable from 'abortable-generators'

// wrap your AsyncGenerators with `abortable` and use `raceAbort` inside
const getItems = abortable(async function* (raceAbort) {
  try {
    yield raceAbort(new Promise((resolve) => {}))
  } catch (err) {
    if (err.name === 'AbortError') {
      // return will throw an AbortError, but it will be ignored even if rethrown here
      return
    }
    throw err
  } finally {
    // done
  }
})
const items = getItems()

setTimeout(() => {
  // some time later
  // return will throw an AbortError into the generator
  items.return()
}, 100)
for await (let item of items) {
  // generator didn't yield anything
}
```

### Throw an error into a "stuck" AsyncGenerators w/ throw

Here's an example of how to throw an error into a "stuck" AsyncGenerators using abortable-generator

```js
import abortable from 'abortable-generators'

// wrap your AsyncGenerators with `abortable` and use `raceAbort` inside
const getItems = abortable(async function* (raceAbort) {
  try {
    yield raceAbort(new Promise((resolve) => {}))
  } catch (err) {
    // [Error: boom]
    throw err
  } finally {
    // done
  }
})
const items = getItems()

setTimeout(() => {
  // some time later
  // return will throw this error into the generator
  const err = new Error('boom')
  items.throw(err)
}, 100)
for await (let item of items) {
  // generator didn't yield anything
}
```

### Abort "stuck" AsyncGenerators w/ an AbortSignal

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
      // abort will throw an AbortError, but it will be ignored even if rethrown here
      return
    }
    throw err
  } finally {
    // done
  }
})

// abort-signal can also be used to abort abortable generators
const items = getItems(signal)

setTimeout(() => {
  // some time later
  controller.abort()
}, 100)
for await (let item of items) {
  //
}
```

### Abort AsyncGenerators containing cancellable Promises

Here's an example of how to abort AsyncGenerators that contain cancellable Promises (supporting AbortSignal)

```js
import abortable from 'abortable-generators'

const getItems = abortable(async function* (raceAbort) {
  try {
    yield raceAbort((signal) => fetch('https://codeshare.io', { signal }))
  } catch (err) {
    if (err.name === 'AbortError') {
      // cancelled fetch will throw an AbortError, but it will be ignored even if rethrown here
      return
    }
    throw err
  } finally {
    // done
  }
})

const items = getItems()

setTimeout(() => {
  // some time later
  items.return()
}, 100)
for await (let item of items) {
  //
}
```

### Advanced Example: Abort nested AsyncGenerators w/ multiple Promises and external AbortSignal

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
      // aborted promises will throw an AbortError, but it will be ignored even if rethrown here
      return
    }
    throw err
  } finally {
    // done
  }
})
const getItems = abortable(async function* (raceAbort) {
  let moreItems
  try {
    moreItems = await raceAbort(signal => getMoreItems(signal))
    for await (let item in moreItems) {
      yield item
    }
    await raceAbort(timeoutPromise(100))
    yield raceAbort((signal) => fetch('https://codeshare.io', { signal }))
  } catch (err) {
    if (err.name === 'AbortError') {
      // aborted promises will throw an AbortError, but it will be ignored even if rethrown here
      return
    }
    // if you want to throw an error into a child generator you'll need to call throw manually
    // if (err instanceof FooError) await moreItems.throw(err)
    throw err
  } finally {
    // done
    await moreItems?.return()
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
