import abortable from '../index'

describe('abortable throw tests', () => {
  describe('generator baseline throw tests', () => {
    it('should work like expected (generator rethrows errors)', () => {
      const createGen = function* () {
        try {
          yield 1
          yield 2
          yield 3
          yield 4
        } catch (err) {
          order.push(['inside-gen catch', err])
          throw err
        }
      }

      let index = 0
      const err = new Error('boom')
      const order = []
      const gen = createGen()
      try {
        for (let result of gen) {
          order.push(['for-of result', result])
          if (index === 2) {
            try {
              order.push(['gen.throw'])
              gen.throw(err)
            } catch (err) {
              order.push(['gen.throw catch', err])
            }
          }
          index++
        }
      } catch (err) {
        order.push(['for-of catch', err])
      } finally {
        order.push(['for-of finally'])
      }

      expect(order).toMatchInlineSnapshot(`
        Array [
          Array [
            "for-of result",
            1,
          ],
          Array [
            "for-of result",
            2,
          ],
          Array [
            "for-of result",
            3,
          ],
          Array [
            "gen.throw",
          ],
          Array [
            "inside-gen catch",
            [Error: boom],
          ],
          Array [
            "gen.throw catch",
            [Error: boom],
          ],
          Array [
            "for-of finally",
          ],
        ]
      `)
    })

    it('should work like expected (generator ignores thrown errors)', () => {
      const createGen = function* () {
        try {
          yield 1
          yield 2
          yield 3
          yield 4
        } catch (err) {
          order.push(['inside-gen catch', err])
          // ignores thrown errors
        }
      }

      let index = 0
      const err = new Error('boom')
      const order = []
      const gen = createGen()
      try {
        for (let result of gen) {
          order.push(['for-of result', result])
          if (index === 2) {
            try {
              order.push(['gen.throw'])
              gen.throw(err)
            } catch (err) {
              order.push(['gen.throw catch', err])
            }
          }
          index++
        }
      } catch (err) {
        order.push(['for-of catch', err])
      } finally {
        order.push(['for-of finally'])
      }

      expect(order).toMatchInlineSnapshot(`
        Array [
          Array [
            "for-of result",
            1,
          ],
          Array [
            "for-of result",
            2,
          ],
          Array [
            "for-of result",
            3,
          ],
          Array [
            "gen.throw",
          ],
          Array [
            "inside-gen catch",
            [Error: boom],
          ],
          Array [
            "for-of finally",
          ],
        ]
      `)
    })

    it('should work like expected (generator ignores thrown errors and yields additional results)', () => {
      const createGen = function* () {
        try {
          yield 1
          yield 2
          yield 3
          yield 4
        } catch (err) {
          order.push(['inside-gen catch', err])
          // ignores thrown errors
          yield 5
          yield 6
          yield 7
        }
      }

      let index = 0
      const err = new Error('boom')
      const order = []
      const gen = createGen()
      try {
        for (let result of gen) {
          order.push(['for-of result', result])
          if (index === 2) {
            try {
              order.push(['gen.throw'])
              gen.throw(err)
            } catch (err) {
              order.push(['gen.throw catch', err])
            }
          }
          index++
        }
      } catch (err) {
        order.push(['for-of catch', err])
      } finally {
        order.push(['for-of finally'])
      }

      expect(order).toMatchInlineSnapshot(`
        Array [
          Array [
            "for-of result",
            1,
          ],
          Array [
            "for-of result",
            2,
          ],
          Array [
            "for-of result",
            3,
          ],
          Array [
            "gen.throw",
          ],
          Array [
            "inside-gen catch",
            [Error: boom],
          ],
          Array [
            "for-of result",
            6,
          ],
          Array [
            "for-of result",
            7,
          ],
          Array [
            "for-of finally",
          ],
        ]
      `)
    })

    it('should work like expected (generator throws error)', () => {
      const createGen = function* () {
        try {
          yield 1
          yield 2
          throw err
          yield 3
          yield 4
        } catch (err) {
          order.push(['inside-gen catch', err])
          throw err
        }
      }

      let index = 0
      const err = new Error('boom')
      const order = []
      const gen = createGen()
      try {
        for (let result of gen) {
          order.push(['for-of result', result])
          index++
        }
      } catch (err) {
        order.push(['for-of catch', err])
      } finally {
        order.push(['for-of finally'])
      }

      expect(order).toMatchInlineSnapshot(`
        Array [
          Array [
            "for-of result",
            1,
          ],
          Array [
            "for-of result",
            2,
          ],
          Array [
            "inside-gen catch",
            [Error: boom],
          ],
          Array [
            "for-of catch",
            [Error: boom],
          ],
          Array [
            "for-of finally",
          ],
        ]
      `)
    })

    it('should work like expected (generator throws error, ignores it and yields additional results)', () => {
      const createGen = function* () {
        try {
          yield 1
          yield 2
          throw err
          yield 3
          yield 4
        } catch (err) {
          order.push(['inside-gen catch', err])
          throw err
        }
      }

      let index = 0
      const err = new Error('boom')
      const order = []
      const gen = createGen()
      try {
        for (let result of gen) {
          order.push(['for-of result', result])
          index++
        }
      } catch (err) {
        order.push(['for-of catch', err])
      } finally {
        order.push(['for-of finally'])
      }

      expect(order).toMatchInlineSnapshot(`
        Array [
          Array [
            "for-of result",
            1,
          ],
          Array [
            "for-of result",
            2,
          ],
          Array [
            "inside-gen catch",
            [Error: boom],
          ],
          Array [
            "for-of catch",
            [Error: boom],
          ],
          Array [
            "for-of finally",
          ],
        ]
      `)
    })
  })

  describe('async generator throw tests', () => {
    it('should work like expected (generator rethrows errors)', async () => {
      const createGen = async function* () {
        try {
          yield Promise.resolve(1)
          yield Promise.resolve(2)
          yield Promise.resolve(3)
          yield Promise.resolve(4)
        } catch (err) {
          order.push(['inside-gen catch', err])
          throw err
        }
      }

      let index = 0
      const err = new Error('boom')
      const order = []
      const gen = createGen()
      try {
        for await (let result of gen) {
          order.push(['for-of result', result])
          if (index === 2) {
            try {
              order.push(['gen.throw'])
              await gen.throw(err)
            } catch (err) {
              order.push(['gen.throw catch', err])
            }
          }
          index++
        }
      } catch (err) {
        order.push(['for-of catch', err])
      } finally {
        order.push(['for-of finally'])
      }

      expect(order).toMatchInlineSnapshot(`
        Array [
          Array [
            "for-of result",
            1,
          ],
          Array [
            "for-of result",
            2,
          ],
          Array [
            "for-of result",
            3,
          ],
          Array [
            "gen.throw",
          ],
          Array [
            "inside-gen catch",
            [Error: boom],
          ],
          Array [
            "gen.throw catch",
            [Error: boom],
          ],
          Array [
            "for-of finally",
          ],
        ]
      `)
    })

    it('should work like expected (generator ignores thrown errors)', async () => {
      const createGen = async function* () {
        try {
          yield Promise.resolve(1)
          yield Promise.resolve(2)
          yield Promise.resolve(3)
          yield Promise.resolve(4)
        } catch (err) {
          order.push(['inside-gen catch', err])
          // ignores thrown errors
        }
      }

      let index = 0
      const err = new Error('boom')
      const order = []
      const gen = createGen()
      try {
        for await (let result of gen) {
          order.push(['for-of result', result])
          if (index === 2) {
            try {
              order.push(['gen.throw'])
              await gen.throw(err)
            } catch (err) {
              order.push(['gen.throw catch', err])
            }
          }
          index++
        }
      } catch (err) {
        order.push(['for-of catch', err])
      } finally {
        order.push(['for-of finally'])
      }

      expect(order).toMatchInlineSnapshot(`
        Array [
          Array [
            "for-of result",
            1,
          ],
          Array [
            "for-of result",
            2,
          ],
          Array [
            "for-of result",
            3,
          ],
          Array [
            "gen.throw",
          ],
          Array [
            "inside-gen catch",
            [Error: boom],
          ],
          Array [
            "gen.throw catch",
            [Error: boom],
          ],
          Array [
            "for-of finally",
          ],
        ]
      `)
    })

    it('should work like expected (generator ignores thrown errors and yields additional results)', async () => {
      const createGen = async function* () {
        try {
          yield Promise.resolve(1)
          yield Promise.resolve(2)
          yield Promise.resolve(3)
          yield Promise.resolve(4)
        } catch (err) {
          order.push(['inside-gen catch', err])
          // ignores thrown errors
          yield Promise.resolve(5)
          yield Promise.resolve(6)
          yield Promise.resolve(7)
        }
      }

      let index = 0
      const err = new Error('boom')
      const order = []
      const gen = createGen()
      try {
        for await (let result of gen) {
          order.push(['for-of result', result])
          if (index === 2) {
            try {
              order.push(['gen.throw'])
              await gen.throw(err)
            } catch (err) {
              order.push(['gen.throw catch', err])
            }
          }
          index++
        }
      } catch (err) {
        order.push(['for-of catch', err])
      } finally {
        order.push(['for-of finally'])
      }

      expect(order).toMatchInlineSnapshot(`
        Array [
          Array [
            "for-of result",
            1,
          ],
          Array [
            "for-of result",
            2,
          ],
          Array [
            "for-of result",
            3,
          ],
          Array [
            "gen.throw",
          ],
          Array [
            "inside-gen catch",
            [Error: boom],
          ],
          Array [
            "for-of result",
            6,
          ],
          Array [
            "for-of result",
            7,
          ],
          Array [
            "for-of finally",
          ],
        ]
      `)
    })

    it('should work like expected (generator throws error)', async () => {
      const createGen = async function* () {
        try {
          yield Promise.resolve(1)
          yield Promise.resolve(2)
          throw err
          yield Promise.resolve(3)
          yield Promise.resolve(4)
        } catch (err) {
          order.push(['inside-gen catch', err])
          throw err
        }
      }

      let index = 0
      const err = new Error('boom')
      const order = []
      const gen = createGen()
      try {
        for await (let result of gen) {
          order.push(['for-of result', result])
          index++
        }
      } catch (err) {
        order.push(['for-of catch', err])
      } finally {
        order.push(['for-of finally'])
      }

      expect(order).toMatchInlineSnapshot(`
        Array [
          Array [
            "for-of result",
            1,
          ],
          Array [
            "for-of result",
            2,
          ],
          Array [
            "inside-gen catch",
            [Error: boom],
          ],
          Array [
            "for-of catch",
            [Error: boom],
          ],
          Array [
            "for-of finally",
          ],
        ]
      `)
    })

    it('should work like expected (generator rejects error)', async () => {
      const createGen = async function* () {
        try {
          yield Promise.resolve(1)
          yield Promise.resolve(2)
          yield Promise.reject(err)
          yield Promise.resolve(3)
          yield Promise.resolve(4)
        } catch (err) {
          order.push(['inside-gen catch', err])
          throw err
        }
      }

      let index = 0
      const err = new Error('boom')
      const order = []
      const gen = createGen()
      try {
        for await (let result of gen) {
          order.push(['for-of result', result])
          index++
        }
      } catch (err) {
        order.push(['for-of catch', err])
      } finally {
        order.push(['for-of finally'])
      }

      expect(order).toMatchInlineSnapshot(`
        Array [
          Array [
            "for-of result",
            1,
          ],
          Array [
            "for-of result",
            2,
          ],
          Array [
            "inside-gen catch",
            [Error: boom],
          ],
          Array [
            "for-of catch",
            [Error: boom],
          ],
          Array [
            "for-of finally",
          ],
        ]
      `)
    })

    it('should work like expected (generator throws error, ignores it and yields additional results)', async () => {
      const createGen = async function* () {
        try {
          yield Promise.resolve(1)
          yield Promise.resolve(2)
          throw err
          yield Promise.resolve(3)
          yield Promise.resolve(4)
        } catch (err) {
          order.push(['inside-gen catch', err])
          yield Promise.resolve(5)
          yield Promise.resolve(6)
          yield Promise.resolve(7)
        }
      }

      let index = 0
      const err = new Error('boom')
      const order = []
      const gen = createGen()
      try {
        for await (let result of gen) {
          order.push(['for-of result', result])
          index++
        }
      } catch (err) {
        order.push(['for-of catch', err])
      } finally {
        order.push(['for-of finally'])
      }

      expect(order).toMatchInlineSnapshot(`
        Array [
          Array [
            "for-of result",
            1,
          ],
          Array [
            "for-of result",
            2,
          ],
          Array [
            "inside-gen catch",
            [Error: boom],
          ],
          Array [
            "for-of result",
            5,
          ],
          Array [
            "for-of result",
            6,
          ],
          Array [
            "for-of result",
            7,
          ],
          Array [
            "for-of finally",
          ],
        ]
      `)
    })

    it('should work like expected (generator rejects error, ignores it and yields additional results)', async () => {
      const createGen = async function* () {
        try {
          yield Promise.resolve(1)
          yield Promise.resolve(2)
          yield Promise.reject(err)
          yield Promise.resolve(3)
          yield Promise.resolve(4)
        } catch (err) {
          order.push(['inside-gen catch', err])
          yield Promise.resolve(5)
          yield Promise.resolve(6)
          yield Promise.resolve(7)
        }
      }

      let index = 0
      const err = new Error('boom')
      const order = []
      const gen = createGen()
      try {
        for await (let result of gen) {
          order.push(['for-of result', result])
          index++
        }
      } catch (err) {
        order.push(['for-of catch', err])
      } finally {
        order.push(['for-of finally'])
      }

      expect(order).toMatchInlineSnapshot(`
        Array [
          Array [
            "for-of result",
            1,
          ],
          Array [
            "for-of result",
            2,
          ],
          Array [
            "inside-gen catch",
            [Error: boom],
          ],
          Array [
            "for-of result",
            5,
          ],
          Array [
            "for-of result",
            6,
          ],
          Array [
            "for-of result",
            7,
          ],
          Array [
            "for-of finally",
          ],
        ]
      `)
    })
  })

  describe('abortable async generator throw tests', () => {
    it('should work like expected (generator rethrows errors)', async () => {
      const createGen = abortable(async function* () {
        try {
          yield Promise.resolve(1)
          yield Promise.resolve(2)
          yield Promise.resolve(3)
          yield Promise.resolve(4)
        } catch (err) {
          order.push(['inside-gen catch', err])
          throw err
        }
      })

      let index = 0
      const err = new Error('boom')
      const order = []
      const gen = createGen()
      try {
        for await (let result of gen) {
          order.push(['for-of result', result])
          if (index === 2) {
            try {
              order.push(['gen.throw'])
              await gen.throw(err)
            } catch (err) {
              order.push(['gen.throw catch', err])
            }
          }
          index++
        }
      } catch (err) {
        order.push(['for-of catch', err])
      } finally {
        order.push(['for-of finally'])
        expect(gen.done).toBe(true)
      }

      expect(order).toMatchInlineSnapshot(`
        Array [
          Array [
            "for-of result",
            1,
          ],
          Array [
            "for-of result",
            2,
          ],
          Array [
            "for-of result",
            3,
          ],
          Array [
            "gen.throw",
          ],
          Array [
            "inside-gen catch",
            [Error: boom],
          ],
          Array [
            "gen.throw catch",
            [Error: boom],
          ],
          Array [
            "for-of finally",
          ],
        ]
      `)
    })

    it('should work like expected (generator ignores thrown errors)', async () => {
      const createGen = abortable(async function* () {
        try {
          yield Promise.resolve(1)
          yield Promise.resolve(2)
          yield Promise.resolve(3)
          yield Promise.resolve(4)
        } catch (err) {
          order.push(['inside-gen catch', err])
          // ignores thrown errors
        }
      })

      let index = 0
      const err = new Error('boom')
      const order = []
      const gen = createGen()
      try {
        for await (let result of gen) {
          order.push(['for-of result', result])
          if (index === 2) {
            try {
              order.push(['gen.throw'])
              await gen.throw(err)
            } catch (err) {
              order.push(['gen.throw catch', err])
            }
          }
          index++
        }
      } catch (err) {
        order.push(['for-of catch', err])
      } finally {
        order.push(['for-of finally'])
        expect(gen.done).toBe(true)
      }

      expect(order).toMatchInlineSnapshot(`
        Array [
          Array [
            "for-of result",
            1,
          ],
          Array [
            "for-of result",
            2,
          ],
          Array [
            "for-of result",
            3,
          ],
          Array [
            "gen.throw",
          ],
          Array [
            "inside-gen catch",
            [Error: boom],
          ],
          Array [
            "gen.throw catch",
            [Error: boom],
          ],
          Array [
            "for-of finally",
          ],
        ]
      `)
    })

    it('should work like expected (generator ignores thrown errors and yields additional results)', async () => {
      const createGen = abortable(async function* () {
        try {
          yield Promise.resolve(1)
          yield Promise.resolve(2)
          yield Promise.resolve(3)
          yield Promise.resolve(4)
        } catch (err) {
          order.push(['inside-gen catch', err])
          // ignores thrown errors
          yield Promise.resolve(5)
          yield Promise.resolve(6)
          yield Promise.resolve(7)
        }
      })

      let index = 0
      const err = new Error('boom')
      const order = []
      const gen = createGen()
      try {
        for await (let result of gen) {
          order.push(['for-of result', result])
          if (index === 2) {
            try {
              order.push(['gen.throw'])
              await gen.throw(err)
            } catch (err) {
              order.push(['gen.throw catch', err])
            }
          }
          index++
        }
      } catch (err) {
        order.push(['for-of catch', err])
      } finally {
        order.push(['for-of finally'])
        expect(gen.done).toBe(true)
      }

      expect(order).toMatchInlineSnapshot(`
        Array [
          Array [
            "for-of result",
            1,
          ],
          Array [
            "for-of result",
            2,
          ],
          Array [
            "for-of result",
            3,
          ],
          Array [
            "gen.throw",
          ],
          Array [
            "inside-gen catch",
            [Error: boom],
          ],
          Array [
            "for-of result",
            6,
          ],
          Array [
            "for-of result",
            7,
          ],
          Array [
            "for-of finally",
          ],
        ]
      `)
    })

    it('should work like expected (generator throws error)', async () => {
      const createGen = abortable(async function* () {
        try {
          yield Promise.resolve(1)
          yield Promise.resolve(2)
          throw err
          yield Promise.resolve(3)
          yield Promise.resolve(4)
        } catch (err) {
          order.push(['inside-gen catch', err])
          throw err
        }
      })

      let index = 0
      const err = new Error('boom')
      const order = []
      const gen = createGen()
      try {
        for await (let result of gen) {
          order.push(['for-of result', result])
          index++
        }
      } catch (err) {
        order.push(['for-of catch', err])
      } finally {
        order.push(['for-of finally'])
        expect(gen.done).toBe(true)
      }

      expect(order).toMatchInlineSnapshot(`
        Array [
          Array [
            "for-of result",
            1,
          ],
          Array [
            "for-of result",
            2,
          ],
          Array [
            "inside-gen catch",
            [Error: boom],
          ],
          Array [
            "for-of catch",
            [Error: boom],
          ],
          Array [
            "for-of finally",
          ],
        ]
      `)
    })

    it('should work like expected (generator rejects error)', async () => {
      const createGen = abortable(async function* () {
        try {
          yield Promise.resolve(1)
          yield Promise.resolve(2)
          yield Promise.reject(err)
          yield Promise.resolve(3)
          yield Promise.resolve(4)
        } catch (err) {
          order.push(['inside-gen catch', err])
          throw err
        }
      })

      let index = 0
      const err = new Error('boom')
      const order = []
      const gen = createGen()
      try {
        for await (let result of gen) {
          order.push(['for-of result', result])
          index++
        }
      } catch (err) {
        order.push(['for-of catch', err])
      } finally {
        order.push(['for-of finally'])
        expect(gen.done).toBe(true)
      }

      expect(order).toMatchInlineSnapshot(`
        Array [
          Array [
            "for-of result",
            1,
          ],
          Array [
            "for-of result",
            2,
          ],
          Array [
            "inside-gen catch",
            [Error: boom],
          ],
          Array [
            "for-of catch",
            [Error: boom],
          ],
          Array [
            "for-of finally",
          ],
        ]
      `)
    })

    it('should work like expected (generator throws error, ignores it and yields additional results)', async () => {
      const createGen = abortable(async function* () {
        try {
          yield Promise.resolve(1)
          yield Promise.resolve(2)
          throw err
          yield Promise.resolve(3)
          yield Promise.resolve(4)
        } catch (err) {
          order.push(['inside-gen catch', err])
          yield Promise.resolve(5)
          yield Promise.resolve(6)
          yield Promise.resolve(7)
        }
      })

      let index = 0
      const err = new Error('boom')
      const order = []
      const gen = createGen()
      try {
        for await (let result of gen) {
          order.push(['for-of result', result])
          index++
        }
      } catch (err) {
        order.push(['for-of catch', err])
      } finally {
        order.push(['for-of finally'])
        expect(gen.done).toBe(true)
      }

      expect(order).toMatchInlineSnapshot(`
        Array [
          Array [
            "for-of result",
            1,
          ],
          Array [
            "for-of result",
            2,
          ],
          Array [
            "inside-gen catch",
            [Error: boom],
          ],
          Array [
            "for-of result",
            5,
          ],
          Array [
            "for-of result",
            6,
          ],
          Array [
            "for-of result",
            7,
          ],
          Array [
            "for-of finally",
          ],
        ]
      `)
    })

    it('should work like expected (generator rejects error, ignores it and yields additional results)', async () => {
      const createGen = abortable(async function* () {
        try {
          yield Promise.resolve(1)
          yield Promise.resolve(2)
          yield Promise.reject(err)
          yield Promise.resolve(3)
          yield Promise.resolve(4)
        } catch (err) {
          order.push(['inside-gen catch', err])
          yield Promise.resolve(5)
          yield Promise.resolve(6)
          yield Promise.resolve(7)
        }
      })

      let index = 0
      const err = new Error('boom')
      const order = []
      const gen = createGen()
      try {
        for await (let result of gen) {
          order.push(['for-of result', result])
          index++
        }
      } catch (err) {
        order.push(['for-of catch', err])
      } finally {
        order.push(['for-of finally'])
        expect(gen.done).toBe(true)
      }

      expect(order).toMatchInlineSnapshot(`
        Array [
          Array [
            "for-of result",
            1,
          ],
          Array [
            "for-of result",
            2,
          ],
          Array [
            "inside-gen catch",
            [Error: boom],
          ],
          Array [
            "for-of result",
            5,
          ],
          Array [
            "for-of result",
            6,
          ],
          Array [
            "for-of result",
            7,
          ],
          Array [
            "for-of finally",
          ],
        ]
      `)
    })
  })

  describe('abortable stuck async generator throw tests w/ raceAbort', () => {
    it('should work like expected (generator rethrows errors)', async () => {
      const createGen = abortable(async function* (raceAbort) {
        try {
          yield raceAbort(Promise.resolve(1))
          yield raceAbort(Promise.resolve(2))
          yield raceAbort(Promise.resolve(3))
          setTimeout(() => {
            trigger()
          }, 10)
          yield raceAbort(new Promise((resolve) => {}))
          // yield raceAbort(Promise.resolve(4))
        } catch (err) {
          order.push(['inside-gen catch', err])
          throw err
        }
      })
      async function trigger() {
        try {
          order.push(['gen.throw'])
          await gen.throw(err)
        } catch (err) {
          order.push(['gen.throw catch', err])
        }
      }

      let index = 0
      const err = new Error('boom')
      const order = []
      const gen = createGen()
      try {
        for await (let result of gen) {
          order.push(['for-of result', result])
          index++
        }
      } catch (err) {
        order.push(['for-of catch', err])
      } finally {
        order.push(['for-of finally'])
        expect(gen.done).toBe(true)
      }

      expect(order).toMatchInlineSnapshot(`
        Array [
          Array [
            "for-of result",
            1,
          ],
          Array [
            "for-of result",
            2,
          ],
          Array [
            "for-of result",
            3,
          ],
          Array [
            "gen.throw",
          ],
          Array [
            "inside-gen catch",
            [Error: boom],
          ],
          Array [
            "for-of catch",
            [Error: boom],
          ],
          Array [
            "for-of finally",
          ],
        ]
      `)
    })

    it('should work like expected (generator ignores thrown errors)', async () => {
      const createGen = abortable(async function* (raceAbort) {
        try {
          yield raceAbort(Promise.resolve(1))
          yield raceAbort(Promise.resolve(2))
          yield raceAbort(Promise.resolve(3))
          setTimeout(() => {
            trigger()
          }, 10)
          await raceAbort(new Promise((resolve) => {}))
          yield raceAbort(Promise.resolve(4))
        } catch (err) {
          order.push(['inside-gen catch', err])
          // ignores thrown errors
        }
      })
      async function trigger() {
        try {
          order.push(['gen.throw'])
          await gen.throw(err)
        } catch (err) {
          order.push(['gen.throw catch', err])
        }
      }

      let index = 0
      const err = new Error('boom')
      const order = []
      const gen = createGen()
      try {
        for await (let result of gen) {
          order.push(['for-of result', result])
          if (index === 2) {
            try {
              order.push(['gen.throw'])
              await gen.throw(err)
            } catch (err) {
              order.push(['gen.throw catch', err])
            }
          }
          index++
        }
      } catch (err) {
        order.push(['for-of catch', err])
      } finally {
        order.push(['for-of finally'])
        expect(gen.done).toBe(true)
      }

      expect(order).toMatchInlineSnapshot(`
        Array [
          Array [
            "for-of result",
            1,
          ],
          Array [
            "for-of result",
            2,
          ],
          Array [
            "for-of result",
            3,
          ],
          Array [
            "gen.throw",
          ],
          Array [
            "inside-gen catch",
            [Error: boom],
          ],
          Array [
            "gen.throw catch",
            [Error: boom],
          ],
          Array [
            "for-of finally",
          ],
        ]
      `)
    })

    it('should work like expected (generator ignores thrown errors and yields additional results)', async () => {
      const createGen = abortable(async function* (raceAbort) {
        try {
          yield raceAbort(Promise.resolve(1))
          yield raceAbort(Promise.resolve(2))
          yield raceAbort(Promise.resolve(3))
          setTimeout(() => {
            trigger()
          }, 10)
          await raceAbort(new Promise((resolve) => {}))
          yield raceAbort(Promise.resolve(4))
        } catch (err) {
          order.push(['inside-gen catch', err])
          // ignores thrown errors
          yield raceAbort(Promise.resolve(5))
          yield raceAbort(Promise.resolve(6))
          yield raceAbort(Promise.resolve(7))
        }
      })
      async function trigger() {
        try {
          order.push(['gen.throw'])
          await gen.throw(err)
        } catch (err) {
          order.push(['gen.throw catch', err])
        }
      }

      let index = 0
      const err = new Error('boom')
      const order = []
      const gen = createGen()
      try {
        for await (let result of gen) {
          order.push(['for-of result', result])
          if (index === 2) {
            try {
              order.push(['gen.throw'])
              await gen.throw(err)
            } catch (err) {
              order.push(['gen.throw catch', err])
            }
          }
          index++
        }
      } catch (err) {
        order.push(['for-of catch', err])
      } finally {
        order.push(['for-of finally'])
        expect(gen.done).toBe(true)
      }

      expect(order).toMatchInlineSnapshot(`
        Array [
          Array [
            "for-of result",
            1,
          ],
          Array [
            "for-of result",
            2,
          ],
          Array [
            "for-of result",
            3,
          ],
          Array [
            "gen.throw",
          ],
          Array [
            "inside-gen catch",
            [Error: boom],
          ],
          Array [
            "for-of result",
            6,
          ],
          Array [
            "for-of result",
            7,
          ],
          Array [
            "for-of finally",
          ],
        ]
      `)
    })
  })

  describe('abortable stuck async generator throw tests without raceAbort', () => {
    it('should work like expected (generator rethrows errors)', async () => {
      const createGen = abortable(async function* () {
        try {
          yield Promise.resolve(1)
          yield Promise.resolve(2)
          yield Promise.resolve(3)
          await new Promise((resolve) => {})
          yield Promise.resolve(4)
        } catch (err) {
          order.push(['inside-gen catch', err])
          throw err
        }
      })

      let index = 0
      const err = new Error('boom')
      const order = []
      const gen = createGen()
      try {
        for await (let result of gen) {
          order.push(['for-of result', result])
          if (index === 2) {
            try {
              order.push(['gen.throw'])
              await gen.throw(err)
            } catch (err) {
              order.push(['gen.throw catch', err])
            }
          }
          index++
        }
      } catch (err) {
        order.push(['for-of catch', err])
      } finally {
        order.push(['for-of finally'])
        expect(gen.done).toBe(true)
      }

      expect(order).toMatchInlineSnapshot(`
        Array [
          Array [
            "for-of result",
            1,
          ],
          Array [
            "for-of result",
            2,
          ],
          Array [
            "for-of result",
            3,
          ],
          Array [
            "gen.throw",
          ],
          Array [
            "inside-gen catch",
            [Error: boom],
          ],
          Array [
            "gen.throw catch",
            [Error: boom],
          ],
          Array [
            "for-of finally",
          ],
        ]
      `)
    })

    it('should work like expected (generator ignores thrown errors)', async () => {
      const createGen = abortable(async function* () {
        try {
          yield Promise.resolve(1)
          yield Promise.resolve(2)
          yield Promise.resolve(3)
          await new Promise((resolve) => {})
          yield Promise.resolve(4)
        } catch (err) {
          order.push(['inside-gen catch', err])
          // ignores thrown errors
        }
      })

      let index = 0
      const err = new Error('boom')
      const order = []
      const gen = createGen()
      try {
        for await (let result of gen) {
          order.push(['for-of result', result])
          if (index === 2) {
            try {
              order.push(['gen.throw'])
              await gen.throw(err)
            } catch (err) {
              order.push(['gen.throw catch', err])
            }
          }
          index++
        }
      } catch (err) {
        order.push(['for-of catch', err])
      } finally {
        order.push(['for-of finally'])
        expect(gen.done).toBe(true)
      }

      expect(order).toMatchInlineSnapshot(`
        Array [
          Array [
            "for-of result",
            1,
          ],
          Array [
            "for-of result",
            2,
          ],
          Array [
            "for-of result",
            3,
          ],
          Array [
            "gen.throw",
          ],
          Array [
            "inside-gen catch",
            [Error: boom],
          ],
          Array [
            "gen.throw catch",
            [Error: boom],
          ],
          Array [
            "for-of finally",
          ],
        ]
      `)
    })

    it('should work like expected (generator ignores thrown errors and yields additional results)', async () => {
      const createGen = abortable(async function* () {
        try {
          yield Promise.resolve(1)
          yield Promise.resolve(2)
          yield Promise.resolve(3)
          await new Promise((resolve) => {})
          yield Promise.resolve(4)
        } catch (err) {
          order.push(['inside-gen catch', err])
          // ignores thrown errors
          yield Promise.resolve(5)
          yield Promise.resolve(6)
          yield Promise.resolve(7)
        }
      })

      let index = 0
      const err = new Error('boom')
      const order = []
      const gen = createGen()
      try {
        for await (let result of gen) {
          order.push(['for-of result', result])
          if (index === 2) {
            try {
              order.push(['gen.throw'])
              await gen.throw(err)
            } catch (err) {
              order.push(['gen.throw catch', err])
            }
          }
          index++
        }
      } catch (err) {
        order.push(['for-of catch', err])
      } finally {
        order.push(['for-of finally'])
        expect(gen.done).toBe(true)
      }

      expect(order).toMatchInlineSnapshot(`
        Array [
          Array [
            "for-of result",
            1,
          ],
          Array [
            "for-of result",
            2,
          ],
          Array [
            "for-of result",
            3,
          ],
          Array [
            "gen.throw",
          ],
          Array [
            "inside-gen catch",
            [Error: boom],
          ],
          Array [
            "for-of result",
            6,
          ],
          Array [
            "for-of result",
            7,
          ],
          Array [
            "for-of finally",
          ],
        ]
      `)
    })
  })
})
