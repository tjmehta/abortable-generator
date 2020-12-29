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
    const abortGenerator = () => controller.abort()
    if (parentSignal) {
      if (parentSignal.aborted) {
        abortGenerator()
      } else {
        parentSignal.addEventListener('abort', abortGenerator)
      }
    }
    const throwQueue = new PullQueue<never>()
    let gen
    if (controller.signal.aborted) {
      gen = (async function* () {})() as AsyncGenerator<never, never, never>
    } else {
      gen = createGen(async function raceGenAbort(task) {
        const throwAbortController = new AbortController()
        const taskAbortController = new AbortController()
        const cleanup = () =>
          controller.signal.removeEventListener('abort', abortTaskAndThrow)
        const abortTaskAndThrow = () => {
          cleanup()
          throwAbortController.abort()
          taskAbortController.abort()
        }
        if (controller.signal.aborted) {
          abortTaskAndThrow()
        } else {
          controller.signal.addEventListener('abort', abortTaskAndThrow)
        }
        return Promise.race([
          throwQueue.pull(throwAbortController.signal).finally(() => {
            if (throwAbortController.signal.aborted) {
              return // lost race
            }
            taskAbortController.abort()
          }),
          raceAbortSignal(taskAbortController.signal, task)
            .catch((err) => {
              // if the task errors remove abort event handlers
              cleanup()
              throw err
            })
            .finally(() => {
              if (taskAbortController.signal.aborted) {
                return // lost race
              }
              throwAbortController.abort()
            }),
        ]).then((val) => {
          // @ts-ignore - if task resolves a generator or signal, keep abort event handlers
          if (isGenLike(val)) return val
          // @ts-ignore - hack if use returns the task signal, keep abort event handlers
          if (val === taskAbortController.signal) return val
          cleanup()
          return val
        })
      })
    }
    return wrap(gen, controller, throwQueue)
  }
}

function isGenLike(val: any) {
  return val?.next != null
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
          return debugLogs('return', tickController, controller)
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
          return debugLogs('throw', tickController, controller)
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

async function debugLogs(
  method: string,
  tickController: AbortController,
  controller: AbortController,
) {
  return Promise.resolve()
    .then(() => {
      if (
        process?.env?.NODE_ENV === 'development' &&
        !process?.env?.ABORTABLE_GENERATOR_DISABLE_WARNINGS
      ) {
        return tick(tickController.signal).then(() => {
          console.warn(debugMessage(method))
          if (process?.env?.ABORTABLE_GENERATOR_DEBUG) {
            const interval = setInterval(() => {
              console.warn(
                'AbortableGeneratorWarning: generator still stuck...',
              )
              if (tickController.signal.aborted) clearInterval(interval)
            }, 5000)
          }
        })
      }
    })
    .catch((err) => {
      // ignore and prevent unhandled rejection
    })
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

function debugMessage(method: string) {
  return `AbortableGeneratorWarning: stuck generator detected after ${method}! did you forget to use "raceAbort" or "signal"?
  this dev warning can be disabled via "ABORTABLE_GENERATOR_DISABLE_WARNINGS"
  also this may print false positives for generators that await in finally'
  ${
    process?.env?.ABORTABLE_GENERATOR_DEBUG
      ? ''
      : 'for additional debugging, set "ABORTABLE_GENERATOR_DEBUG" to truthy'
  }
`
}
