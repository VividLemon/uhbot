import { sumBy } from '../src/util'

describe('sum-by', () => {
  it('Sums by the correct value', async () => {
    let value = await sumBy([{ id: 1 }, { id: 2 }], 'id')
    expect(value).toBe(3)
    value = await sumBy([{ id: -1 }, { id: 2 }], 'id')
    expect(value).toBe(1)
    value = await sumBy([{ id: 10 }, { id: 2 }], 'id')
    expect(value).toBe(12)
  })
})
