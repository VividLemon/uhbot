import { addToHop } from '../src/util'

describe('add-to-hop', () => {
  it('Resolves to the correct value', async () => {
    let value = await addToHop(0, 30)
    expect(value).toEqual({ hopsRemaining: 1, newSkill: 24, oldSkill: 0 })
    value = await addToHop(10, 100)
    expect(value).toEqual({ hopsRemaining: 1, newSkill: 49, oldSkill: 10 })
    value = await addToHop(25, 35)
    expect(value).toEqual({ hopsRemaining: 0, newSkill: 38, oldSkill: 25 })
  })
})
