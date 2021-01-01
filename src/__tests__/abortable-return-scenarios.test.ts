import abortable from '../index'

describe('abortable return tests', () => {
  describe('generator baseline return tests', () => {
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
        } finally {
          order.push(['inside-gen finally'])
        }
      }

      let index = 0
      const order = []
      const gen = createGen()
      try {
        for (let result of gen) {
          order.push(['for-of result', result])
          if (index === 2) {
            try {
              order.push(['gen.return'])
              gen.return()
            } catch (err) {
              order.push(['gen.return catch', err])
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
            "gen.return",
          ],
          Array [
            "inside-gen finally",
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
        } finally {
          order.push(['inside-gen finally'])
        }
      }

      let index = 0
      const order = []
      const gen = createGen()
      try {
        for (let result of gen) {
          order.push(['for-of result', result])
          if (index === 2) {
            try {
              order.push(['gen.return'])
              gen.return()
            } catch (err) {
              order.push(['gen.return catch', err])
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
            "gen.return",
          ],
          Array [
            "inside-gen finally",
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
        } finally {
          order.push(['inside-gen finally'])
        }
      }

      let index = 0
      const order = []
      const gen = createGen()
      try {
        for (let result of gen) {
          order.push(['for-of result', result])
          if (index === 2) {
            try {
              order.push(['gen.return'])
              gen.return()
            } catch (err) {
              order.push(['gen.return catch', err])
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
            "gen.return",
          ],
          Array [
            "inside-gen finally",
          ],
          Array [
            "for-of finally",
          ],
        ]
      `)
    })
  })

  describe('async generator return tests', () => {
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
        } finally {
          order.push(['inside-gen finally'])
        }
      }

      let index = 0
      const order = []
      const gen = createGen()
      try {
        for await (let result of gen) {
          order.push(['for-of result', result])
          if (index === 2) {
            try {
              order.push(['gen.return'])
              await gen.return()
            } catch (err) {
              order.push(['gen.return catch', err])
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
            "gen.return",
          ],
          Array [
            "inside-gen finally",
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
        } finally {
          order.push(['inside-gen finally'])
        }
      }

      let index = 0
      const order = []
      const gen = createGen()
      try {
        for await (let result of gen) {
          order.push(['for-of result', result])
          if (index === 2) {
            try {
              order.push(['gen.return'])
              await gen.return()
            } catch (err) {
              order.push(['gen.return catch', err])
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
            "gen.return",
          ],
          Array [
            "inside-gen finally",
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
        } finally {
          order.push(['inside-gen finally'])
        }
      }

      let index = 0
      const order = []
      const gen = createGen()
      try {
        for await (let result of gen) {
          order.push(['for-of result', result])
          if (index === 2) {
            try {
              order.push(['gen.return'])
              await gen.return()
            } catch (err) {
              order.push(['gen.return catch', err])
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
            "gen.return",
          ],
          Array [
            "inside-gen finally",
          ],
          Array [
            "for-of finally",
          ],
        ]
      `)
    })
  })

  describe('abortable async generator return tests', () => {
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
        } finally {
          order.push(['inside-gen finally'])
        }
      })

      let index = 0
      const order = []
      const gen = createGen()
      try {
        for await (let result of gen) {
          order.push(['for-of result', result])
          if (index === 2) {
            try {
              order.push(['gen.return'])
              await gen.return()
            } catch (err) {
              order.push(['gen.return catch', err])
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
            "gen.return",
          ],
          Array [
            "inside-gen finally",
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
        } finally {
          order.push(['inside-gen finally'])
        }
      })

      let index = 0
      const order = []
      const gen = createGen()
      try {
        for await (let result of gen) {
          order.push(['for-of result', result])
          if (index === 2) {
            try {
              order.push(['gen.return'])
              await gen.return()
            } catch (err) {
              order.push(['gen.return catch', err])
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
            "gen.return",
          ],
          Array [
            "inside-gen finally",
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
        } finally {
          order.push(['inside-gen finally'])
        }
      })

      let index = 0
      const order = []
      const gen = createGen()
      try {
        for await (let result of gen) {
          order.push(['for-of result', result])
          if (index === 2) {
            try {
              order.push(['gen.return'])
              await gen.return()
            } catch (err) {
              order.push(['gen.return catch', err])
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
            "gen.return",
          ],
          Array [
            "inside-gen finally",
          ],
          Array [
            "for-of finally",
          ],
        ]
      `)
    })
  })

  describe('abortable stuck async generator return tests w/ raceAbort', () => {
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
        } finally {
          order.push(['inside-gen finally'])
        }
      })
      async function trigger() {
        try {
          order.push(['gen.return'])
          await gen.return()
        } catch (err) {
          order.push(['gen.return catch', err])
        }
      }

      const order = []
      const gen = createGen()
      try {
        for await (let result of gen) {
          order.push(['for-of result', result])
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
            "gen.return",
          ],
          Array [
            "inside-gen catch",
            AbortError {
              "message": "aborted",
              "name": "AbortError",
            },
          ],
          Array [
            "inside-gen finally",
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
        } finally {
          order.push(['inside-gen finally'])
        }
      })
      async function trigger() {
        try {
          order.push(['gen.return'])
          await gen.return()
        } catch (err) {
          order.push(['gen.return catch', err])
        }
      }

      const order = []
      const gen = createGen()
      try {
        for await (let result of gen) {
          order.push(['for-of result', result])
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
            "gen.return",
          ],
          Array [
            "inside-gen catch",
            AbortError {
              "message": "aborted",
              "name": "AbortError",
            },
          ],
          Array [
            "inside-gen finally",
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
        } finally {
          order.push(['inside-gen finally'])
        }
      })
      async function trigger() {
        try {
          order.push(['gen.return'])
          await gen.return()
        } catch (err) {
          order.push(['gen.return catch', err])
        }
      }

      const order = []
      const gen = createGen()
      try {
        for await (let result of gen) {
          order.push(['for-of result', result])
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
            "gen.return",
          ],
          Array [
            "inside-gen catch",
            AbortError {
              "message": "aborted",
              "name": "AbortError",
            },
          ],
          Array [
            "inside-gen finally",
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
          throw err
        } finally {
          order.push(['inside-gen finally'])
        }
      })
      async function trigger() {
        try {
          order.push(['gen.return'])
          await gen.return()
        } catch (err) {
          order.push(['gen.return catch', err])
        }
      }

      const order = []
      const gen = createGen()
      try {
        for await (let result of gen) {
          order.push(['for-of result', result])
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
            "gen.return",
          ],
          Array [
            "inside-gen catch",
            AbortError {
              "message": "aborted",
              "name": "AbortError",
            },
          ],
          Array [
            "inside-gen finally",
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
        } finally {
          order.push(['inside-gen finally'])
        }
      })
      async function trigger() {
        try {
          order.push(['gen.return'])
          await gen.return()
        } catch (err) {
          order.push(['gen.return catch', err])
        }
      }

      const order = []
      const gen = createGen()
      try {
        for await (let result of gen) {
          order.push(['for-of result', result])
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
            "gen.return",
          ],
          Array [
            "inside-gen catch",
            AbortError {
              "message": "aborted",
              "name": "AbortError",
            },
          ],
          Array [
            "inside-gen finally",
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
        } finally {
          order.push(['inside-gen finally'])
        }
      })
      async function trigger() {
        try {
          order.push(['gen.return'])
          await gen.return()
        } catch (err) {
          order.push(['gen.return catch', err])
        }
      }

      const order = []
      const gen = createGen()
      try {
        for await (let result of gen) {
          order.push(['for-of result', result])
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
            "gen.return",
          ],
          Array [
            "inside-gen catch",
            AbortError {
              "message": "aborted",
              "name": "AbortError",
            },
          ],
          Array [
            "inside-gen finally",
          ],
          Array [
            "for-of finally",
          ],
        ]
      `)
    })
  })

  describe('signals', () => {
    it('signal is aborted should create a finished generator', async () => {
      const createGen = abortable(async function* () {
        //
      })
      const controller = new AbortController()
      controller.abort()
      const gen = createGen(controller.signal)
      expect(gen.done).toBe(true)
    })

    it('signal should return generator', async () => {
      const createGen = abortable(async function* () {
        //
      })
      const controller = new AbortController()
      const gen = createGen(controller.signal)
      expect(gen.done).toBe(false)
      controller.abort()
      expect(gen.done).toBe(true)
    })
  })

  describe('complex scenarios', () => {
    it('should work like expected (generator ignores thrown errors and yields additional results)', async () => {
      const createGen2 = abortable(async function* (raceAbort) {
        try {
          yield raceAbort(Promise.resolve(10))
          yield raceAbort(Promise.resolve(20))
          yield raceAbort(Promise.resolve(30))
          await raceAbort(new Promise((resolve) => {}))
          yield raceAbort(Promise.resolve(40))
        } catch (err) {
          order.push(['inside-gen2 catch', err])
          // ignores thrown errors
          yield raceAbort(Promise.resolve(50))
          yield raceAbort(Promise.resolve(60))
          yield raceAbort(Promise.resolve(70))
        } finally {
          order.push(['inside-gen2 finally'])
        }
      })
      const createGen = abortable(async function* (raceAbort) {
        try {
          yield raceAbort(Promise.resolve(1))
          yield raceAbort(Promise.resolve(2))
          yield raceAbort(Promise.resolve(3))
          setTimeout(() => {
            trigger()
          }, 100)
          const gen2 = await raceAbort((signal) => createGen2(signal))
          for await (let item of gen2) {
            yield item
          }
          order.push(['gen for-of complete'])
          await raceAbort(new Promise((resolve) => {}))
          yield raceAbort(Promise.resolve(4))
        } catch (err) {
          order.push(['inside-gen catch', err])
          // ignores thrown errors
          yield raceAbort(Promise.resolve(5))
          yield raceAbort(Promise.resolve(6))
          yield raceAbort(Promise.resolve(7))
        } finally {
          order.push(['inside-gen finally'])
        }
      })
      async function trigger() {
        try {
          order.push(['gen.return'])
          await gen.return()
        } catch (err) {
          order.push(['gen.return catch', err])
        }
      }

      const order = []
      const gen = createGen()
      try {
        for await (let result of gen) {
          order.push(['for-of result', result])
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
            "for-of result",
            10,
          ],
          Array [
            "for-of result",
            20,
          ],
          Array [
            "for-of result",
            30,
          ],
          Array [
            "gen.return",
          ],
          Array [
            "inside-gen2 catch",
            AbortError {
              "message": "aborted",
              "name": "AbortError",
            },
          ],
          Array [
            "inside-gen2 finally",
          ],
          Array [
            "gen for-of complete",
          ],
          Array [
            "inside-gen catch",
            AbortError {
              "message": "aborted",
              "name": "AbortError",
            },
          ],
          Array [
            "inside-gen finally",
          ],
          Array [
            "for-of finally",
          ],
        ]
      `)
    })
  })
})
