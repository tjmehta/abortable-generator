import AbortController from 'abort-controller'
import BaseError from 'baseerr'
import abortable from '../index'

describe('abortable', () => {
  it('should wrap an async generator', async () => {
    const gen = abortable(async function* (raceAbort) {
      yield 1
      yield 2
      yield 3
    })
    const items = []

    for await (let item of gen()) {
      items.push(item)
    }

    expect(items).toMatchInlineSnapshot(`
      Array [
        1,
        2,
        3,
      ]
    `)
  })

  it('should wrap an async generator and abort promises when returned', async () => {
    const createGen = abortable(async function* (raceAbort) {
      try {
        yield Promise.resolve(1)
        yield Promise.resolve(2)
        yield raceAbort(new Promise((resolve) => {}))
      } catch (err) {
        if (err.name === 'AbortError') return
        throw err
      }
    })
    const items = []
    const gen = createGen()

    setTimeout(() => {
      gen.return()
    }, 10)
    for await (let item of gen) {
      items.push(item)
    }

    expect(items).toMatchInlineSnapshot(`
      Array [
        1,
        2,
      ]
    `)
  })

  it('should wrap an async generator and abort cancellable promises (via signal) when returned', async () => {
    const createGen = abortable(async function* (raceAbort) {
      try {
        yield Promise.resolve(1)
        yield Promise.resolve(2)
        yield raceAbort((signal) => mockFetch({ signal }))
      } catch (err) {
        if (err.name === 'AbortError') return
        throw err
      }
    })
    const items = []
    const gen = createGen()

    setTimeout(() => {
      gen.return()
    }, 10)
    for await (let item of gen) {
      items.push(item)
    }

    expect(items).toMatchInlineSnapshot(`
      Array [
        1,
        2,
      ]
    `)
  })

  it('should wrap an async generator and abort cancellable promises (via signal) when thrown', async () => {
    const createGen = abortable(async function* (raceAbort) {
      try {
        yield Promise.resolve(1)
        yield Promise.resolve(2)
        yield raceAbort((signal) => mockFetch({ signal }))
      } catch (err) {
        if (err.name === 'AbortError') return
        throw err
      }
    })
    const items = []
    const gen = createGen()

    setTimeout(() => {
      gen.return()
    }, 10)
    for await (let item of gen) {
      items.push(item)
    }

    expect(items).toMatchInlineSnapshot(`
      Array [
        1,
        2,
      ]
    `)
  })

  it('should wrap an async generator and abort promises when thrown', async () => {
    const createGen = abortable(async function* (raceAbort) {
      try {
        yield Promise.resolve(1)
        yield Promise.resolve(2)
        yield raceAbort(new Promise((resolve) => {}))
      } catch (err) {
        if (err.name === 'AbortError') return
        items.push(err)
      }
    })
    const items = []
    const gen = createGen()

    setTimeout(() => {
      gen.throw(new Error('boom')).catch((err) => {})
    }, 10)
    for await (let item of gen) {
      items.push(item)
    }

    expect(items).toMatchInlineSnapshot(`
      Array [
        1,
        2,
        [Error: boom],
      ]
    `)
  })

  it('should wrap an async generator and abort promises via signal', async () => {
    const createGen = abortable(async function* (raceAbort) {
      try {
        yield Promise.resolve(1)
        yield Promise.resolve(2)
        yield raceAbort(new Promise((resolve) => {}))
      } catch (err) {
        if (err.name === 'AbortError') return
        throw err
      }
    })
    const items = []
    const controller = new AbortController()
    const signal = controller.signal
    const gen = createGen(signal)

    setTimeout(() => {
      controller.abort()
    }, 10)
    for await (let item of gen) {
      items.push(item)
    }

    expect(items).toMatchInlineSnapshot(`
      Array [
        1,
        2,
      ]
    `)
  })

  it('should wrap an async generator and abort promises via aborted signal', async () => {
    const createGen = abortable(async function* (raceAbort) {
      try {
        yield Promise.resolve(1)
        yield Promise.resolve(2)
        yield raceAbort(new Promise((resolve) => {}))
      } catch (err) {
        if (err.name === 'AbortError') return
        throw err
      }
    })
    const items = []
    const controller = new AbortController()
    const signal = controller.signal
    const gen = createGen(signal)

    controller.abort()
    for await (let item of gen) {
      items.push(item)
    }

    expect(items).toMatchInlineSnapshot(`Array []`)
  })

  it('should make nesting async generators easy', async () => {
    const items = []
    const createGen2 = abortable(async function* (raceAbort) {
      try {
        yield Promise.resolve(4)
        yield Promise.resolve(5)
        yield raceAbort(new Promise((resolve) => {}))
      } catch (err) {
        if (err.name === 'AbortError') return
        throw err
      } finally {
        items.push('finally2')
      }
    })
    const createGen1 = abortable(async function* (raceAbort) {
      try {
        yield Promise.resolve(1)
        yield Promise.resolve(2)
        yield Promise.resolve(3)
        const gen2 = createGen2(raceAbort)
        for await (let result of gen2) {
          yield result
        }
      } catch (err) {
        if (err.name === 'AbortError') return
        items.push(err)
      } finally {
        items.push('finally1')
      }
    })

    const gen = createGen1()

    setTimeout(() => {
      gen.throw(new Error('boom')).catch((err) => {})
    }, 10)
    for await (let item of gen) {
      items.push(item)
    }

    expect(items).toMatchInlineSnapshot(`
      Array [
        1,
        2,
        3,
        4,
        5,
        "finally2",
        [Error: boom],
        "finally1",
      ]
    `)
  })

  it('baseline generator and test for return', async () => {
    const createGen = function* () {
      try {
        yield 1
        yield 2
        yield 3
      } catch (err) {
        if (err.name === 'AbortError') return
        items.push(err)
      }
    }
    const items = []
    const gen = createGen()

    for await (let item of gen) {
      items.push(item)
      if (items.length === 2) {
        try {
          gen.return()
        } catch (err) {}
      }
    }

    expect(items).toMatchInlineSnapshot(`
      Array [
        1,
        2,
      ]
    `)
  })

  it('baseline generator and test for throw', async () => {
    const createGen = function* () {
      try {
        yield 1
        yield 2
        yield 3
      } catch (err) {
        if (err.name === 'AbortError') return
        items.push(err)
      }
    }
    const items = []
    const gen = createGen()

    for await (let item of gen) {
      items.push(item)
      if (items.length === 2) {
        try {
          gen.throw(new Error('boom'))
        } catch (err) {
          console.log('ERR', err)
        }
      }
    }

    expect(items).toMatchInlineSnapshot(`
      Array [
        1,
        2,
        [Error: boom],
      ]
    `)
  })

  describe('done', () => {
    it('should set done=true if generator finishes', async () => {
      const createGen = abortable(async function* () {
        yield 10
      })
      const gen = createGen()
      for await (let item of gen) {
      }
      expect(gen.done).toBe(true)
    })

    it('should set done=true if generator finishes due to error', async () => {
      const createGen = abortable(async function* () {
        yield Promise.reject(new Error('boom'))
      })
      const gen = createGen()
      try {
        await gen.next()
      } catch (err) {
        //
      } finally {
        expect(gen.done).toBe(true)
      }
    })

    it('should set done=true if generator finishes due to return', async () => {
      const createGen = abortable<number>(async function* (raceAbort) {
        yield 1
        yield raceAbort(Promise.resolve(10))
      })
      const gen = createGen()
      try {
        await gen.next()
        await gen.return()
      } finally {
        expect(gen.done).toBe(true)
      }
    })

    it('should set done=true if generator finishes due to throw', async () => {
      const createGen = abortable(async function* () {
        yield 1
        yield 2
        yield 3
      })
      const gen = createGen()
      try {
        await gen.next()
        await gen.throw(new Error('boom'))
      } catch (err) {
        //
      } finally {
        expect(gen.done).toBe(true)
      }
    })

    it('should set done=true if generator finishes due to return after init', async () => {
      const createGen = abortable(async function* () {
        yield 1
        yield 2
        yield 3
      })
      const gen = createGen()
      try {
        await gen.return()
      } finally {
        expect(gen.done).toBe(true)
      }
    })

    it('should set done=true if generator finishes due to throw after init', async () => {
      const createGen = abortable(async function* () {
        yield 1
        yield 2
        yield 3
      })
      const gen = createGen()
      try {
        await gen.throw(new Error('boom'))
      } catch (err) {
        //
      } finally {
        expect(gen.done).toBe(true)
      }
    })
  })
})

// function identity(v) {
//   return v
// }
// function noop(v) {
//   return function () {
//     return v({ raceAbort: identity })
//   }
// }
class AbortError extends BaseError<{}> {}
function mockFetch({ signal }: { signal: AbortSignal }) {
  return new Promise((resolve, reject) => {
    function abort() {
      reject(new AbortError('aborted'))
    }
    if (signal.aborted) return void abort()
    signal.addEventListener('abort', abort)
  })
}
