import { addToStat } from '../src/util'

describe('add-to-stat', () => {
  it('Adds to the correct stat', async () => {
    let value = await addToStat(0, 20)
    expect(value).toBe(21)
    value = await addToStat(0, 21)
    expect(value).toBe(23)
    value = await addToStat(5, 10)
    expect(value).toBe(5)
    value = await addToStat(20, 40)
    expect(value).toBe(52)
  })
})
