import { noop } from './util'

class Queue {
  _queue: Array<Function>
  idMap: Map<string, Function>

  constructor() {
    this._queue = []
    this.idMap = new Map()
  }

  enqueue(run: Function, options: { id: any }) {
    const { id } = options
    this.idMap.set(id, run)
    this._queue.push(run)
  }

  dequeue() {
    return this._queue.shift()
  }

  clearWithId(id: any) {
    const targetRunner = this.idMap.get(id)
    const runnerIndex = this._queue.findIndex(item => item === targetRunner)
    if (runnerIndex === -1) {
      return
    }
    this._queue.splice(runnerIndex, 1)
  }

  clear() {
    this._queue = []
  }

  get size() {
    return this._queue.length
  }
}

export default class PQueue {
  queue: Queue
  _pendingCount: number
  _concurrency: number
  _resolveEmpty: () => void

  constructor(opts: any) {
    opts = Object.assign(
      {
        concurrency: Infinity,
        queueClass: Queue
      },
      opts
    )

    if (opts.concurrency < 1) {
      throw new TypeError('Expected `concurrency` to be a number from 1 and up')
    }

    this.queue = new opts.queueClass()
    this._pendingCount = 0
    this._concurrency = opts.concurrency
    this._resolveEmpty = noop
  }

  _next() {
    this._pendingCount--
    if (this.queue.size > 0) {
      this.queue.dequeue()()
    } else {
      this._resolveEmpty()
    }
  }

  add(fn: any, opts: any) {
    return new Promise((resolve, reject) => {
      const run = () => {
        this._pendingCount++
        fn()
          .then(val => {
            resolve(val)
            this._next()
          })
          .catch(err => {
            reject(err)
            this._next()
          })
      }
      if (this._pendingCount < this._concurrency) {
        run()
      } else {
        this.queue.enqueue(run, opts)
      }
    })
  }

  clear() {
    this.queue.clear()
  }

  clearWithId(id: any) {
    this.queue.clearWithId(id)
  }

  onEmpty() {
    return new Promise(resolve => {
      const existingResolve = this._resolveEmpty
      this._resolveEmpty = () => {
        existingResolve()
        resolve(null)
      }
    })
  }

  get size() {
    return this.queue.size
  }

  get pending() {
    return this._pendingCount
  }
}
