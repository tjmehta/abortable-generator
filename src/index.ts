import AbortController from 'abort-controller'
import BaseError from 'baseerr'

class AbortError extends BaseError<{}> {
  constructor() {
    super('aborted')
  }
}

export type AbortableAsyncGeneratorFunction<T, R, N> = (
  raceAbort: <T>(
    task: ((signal: AbortSignal) => Promise<T>) | Promise<T>,
  ) => Promise<T>,
) => AsyncGenerator<T, R, N>

export default function abortable<T, R = any, N = undefined>(
  createGen: AbortableAsyncGeneratorFunction<T, R, N>,
) {
  return function (
    raceAbortOrSignal?:
      | (<T>(
          task: ((signal: AbortSignal) => Promise<T>) | Promise<T>,
        ) => Promise<T>)
      | AbortSignal,
  ) {
    const opts = {
      raceAbort:
        typeof raceAbortOrSignal === 'function' ? raceAbortOrSignal : null,
      signal:
        typeof raceAbortOrSignal !== 'function' ? raceAbortOrSignal : null,
    }

    // create abort controller
    const controller = new AbortController()
    const signal = controller.signal
    let error: Error | null = null

    // get or create race abort
    const raceAbort =
      opts.raceAbort ??
      async function (task) {
        return Promise.race([
          new Promise<T>((resolve, reject) => {
            const abort = () => reject(error ?? new AbortError())
            if (signal.aborted) return void abort()
            signal.addEventListener('abort', abort)
          }),
          typeof task === 'function' ? task(signal) : task,
        ])
      }

    // init genenerator and controller
    const gen = createGen(raceAbort as any)
    const genProxy = {
      done: false,
      async next() {
        try {
          const payload = await gen.next()
          if (payload.done) this.done = true
          return payload
        } catch (err) {
          this.done = true
          throw err
        }
      },
      return(val?: R) {
        this.done = true
        controller.abort()
        return gen.return(val as any)
      },
      throw(err: any) {
        this.done = true
        error = error || err
        controller.abort()
        return gen.throw(err)
      },
      [Symbol.asyncIterator]() {
        return this
      },
    }

    if (opts.signal?.aborted) {
      // @ts-ignore
      genProxy.return()
    } else {
      // @ts-ignore
      opts.signal?.addEventListener('abort', genProxy.return)
    }

    return genProxy
  }
}
