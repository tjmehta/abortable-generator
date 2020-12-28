import AbortController from 'abort-controller'
import PullQueue from 'promise-pull-queue'
import raceAbortSignal from 'race-abort'
import timeout from 'timeout-then'

export type TaskType<TaskResult> =
  | ((signal: AbortSignal) => Promise<TaskResult> | TaskResult)
  | Promise<TaskResult>

export type RaceType = <RaceTaskResult>(
  task: TaskType<RaceTaskResult>,
) => Promise<RaceTaskResult>
export type AbortOptionsType = {
  controller: AbortController
  signal: AbortSignal
  error: any
}

export type AbortableAsyncGeneratorFunction<T, R, N> = (
  race: RaceType,
) => AsyncGenerator<T, R, N>

export default function abortable<T, R = any, N = undefined>(
  createGen: AbortableAsyncGeneratorFunction<T, R, N>,
) {
  return function (parentSignal?: AbortSignal) {
    const controller = new AbortController()
    const handleAbort = () => controller.abort()
    if (parentSignal) {
      if (parentSignal.aborted) {
        handleAbort()
      } else {
        parentSignal.addEventListener('abort', handleAbort)
      }
    }
    const throwQueue = new PullQueue<never>()
    let gen
    if (controller.signal.aborted) {
      gen = (async function* () {})() as AsyncGenerator<never, never, never>
    } else {
      gen = createGen(async function raceGenAbort(task) {
        const raceAbortController = new AbortController()
        const cleanup = () =>
          controller.signal.removeEventListener('abort', handleAbort)
        const handleAbort = () => {
          cleanup()
          raceAbortController.abort()
        }
        if (controller.signal.aborted) {
          handleAbort()
        } else {
          controller.signal.addEventListener('abort', handleAbort)
        }
        return Promise.race([
          throwQueue.pull(raceAbortController.signal),
          raceAbortSignal(raceAbortController.signal, task),
        ]).finally(() => {
          raceAbortController.abort()
        })
      })
    }
    return wrap(gen, controller, throwQueue)
  }
}

function wrap<T, R = any, N = undefined>(
  source: AsyncGenerator<T, R, N>,
  controller: AbortController,
  throwQueue: PullQueue<never>,
) {
  // wrap iterator
  const wrapped = {
    done: false,
    async next() {
      let payload
      try {
        payload = await source.next()
        return payload
      } catch (err) {
        this.done = true
        if (err.name === 'AbortError') {
          // ignore abort errors
          return ({ done: true, value: undefined } as any) as Promise<
            IteratorResult<T, any>
          >
        }
        throw err
      } finally {
        if (payload?.done) this.done = true
      }
    },
    async return(val?: R) {
      // @ts-ignore
      if (this.done) return source.return(val)
      this.done = true
      const tickController = new AbortController()
      tick(tickController.signal)
        .then(() => {
          controller.abort()
          return tick(tickController.signal).then(() => {
            nextTickThrow(
              new Error(
                'stuck generator detected. did you forget to use "raceAbort"?',
              ),
            )
          })
        })
        .catch((err) => {
          // ignore and prevent unhandled rejection
        })
      try {
        // @ts-ignore
        const result = await source.return(val)
        return result
      } finally {
        tickController.abort()
      }
    },
    async throw(err: any): Promise<IteratorResult<T, any>> {
      if (this.done) {
        return source.throw(err)
      }
      const tickController = new AbortController()
      tick(tickController.signal)
        .then(() => {
          throwQueue.pushError(err)
          return tick(tickController.signal).then(() => {
            nextTickThrow(
              new Error(
                'stuck generator detected. did you forget to use "raceAbort"?',
              ),
            )
          })
        })
        .catch((err) => {
          // ignore and prevent unhandled rejection
        })
      try {
        const result = await source.throw(err)
        return result
      } finally {
        tickController.abort()
      }
    },
    [Symbol.asyncIterator]() {
      return this
    },
  }

  const cleanup = () =>
    controller.signal.removeEventListener('abort', handleAbort)
  const handleAbort = () => {
    cleanup()
    wrapped.return().catch((err) => {})
  }
  if (controller.signal.aborted) handleAbort()
  controller.signal.addEventListener('abort', handleAbort)

  return wrapped
}

async function tick(signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (process?.nextTick) {
      raceAbortSignal(
        signal,
        () => new Promise((resolve) => process.nextTick(resolve)),
      ).then(() => resolve(), reject)
    } else {
      raceAbortSignal(signal, () => {
        const promise = timeout(0)
        const handleAbort = () => {
          cleanup()
          promise.clear()
        }
        const cleanup = () => signal.removeEventListener('abort', handleAbort)
        signal.addEventListener('abort', handleAbort)
        try {
          return promise
        } finally {
          cleanup()
        }
      }).then(() => resolve(), reject)
    }
  })
}

function nextTickThrow(err: any) {
  if (process?.nextTick) {
    process.nextTick(() => {
      throw err
    })
  } else {
    setTimeout(() => {
      throw err
    }, 0)
  }
}
