import { addModifiers } from '../src/util'

describe('add-modifiers', () => {
  it('Rejects on number not finite', async () => {
    try {
      await addModifiers('/0', 1)
    } catch (error) {
      expect(error).toEqual({ code: 400, message: 'Number is not finite. Can happen when dividing by zero' })
    }
  })
  it('Rejects when an incorrect format provided', async () => {
    try {
      await addModifiers('a/1', 1)
    } catch (error) {
      expect(error).toEqual({ code: 400, message: 'Incorrect values in modifiers, cannot contain parenthesis, must start with the operator of [+,-,*,/]. Ex: +25/3-3' })
    }
  })
  it('Resolves to the correct value', async () => {
    let value = await addModifiers('+25', 0)
    expect(value).toBe(25)
    value = await addModifiers('+25/5*5-25', 0)
    expect(value).toBe(0)
    value = await addModifiers('+25-10', 0)
    expect(value).toBe(15)
    value = await addModifiers('*10', 1)
    expect(value).toBe(10)
  })
})
