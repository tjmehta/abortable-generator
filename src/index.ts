import BaseError from 'baseerr'

class AbortError extends BaseError<{}> {
  constructor() {
    super('aborted')
  }
}

export type RaceAbort<T> = (
  task: ((signal: AbortSignal) => Promise<T>) | Promise<T>,
) => Promise<T>

export type AbortableAsyncGeneratorFunction<T, R, N> = (
  raceAbort: RaceAbort<T>,
) => AsyncGenerator<T, R, N>

let AC = typeof AbortController !== 'undefined' ? AbortController : undefined
function getAbortController(): typeof AbortController | void {
  return AC
}
export function setAbortController(ac: typeof AbortController) {
  AC = ac
}

export default function abortable<T, R, N>(
  createGen: AbortableAsyncGeneratorFunction<T, R, N>,
) {
  return function (raceAbortOrSignal?: RaceAbort<T> | AbortSignal) {
    const opts = {
      raceAbort:
        typeof raceAbortOrSignal === 'function' ? raceAbortOrSignal : null,
      signal:
        typeof raceAbortOrSignal !== 'function' ? raceAbortOrSignal : null,
    }

    // create abort controller
    const AbortController = getAbortController()
    // @ts-ignore - allow error if null
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
    const gen = createGen(raceAbort)
    const genProxy = {
      next() {
        return gen.next()
      },
      return(val: R) {
        controller.abort()
        return gen.return(val)
      },
      throw(err: any) {
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
