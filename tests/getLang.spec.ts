import { getLang } from '../src/util'

describe('get-lang', () => {
  it('Returns the lang if hyphen', async () => {
    const value = await getLang('en-US')
    expect(value).toBe('en')
  })
  it('Returns the lang if hyphen on extended input', async () => {
    const value = await getLang('eeeeen-US')
    expect(value).toBe('eeeeen')
  })
  it('Returns the lang if no hyphen', async () => {
    const value = await getLang('en')
    expect(value).toBe('en')
  })
  it('Returns the lang if lang is passed 2 length but no hyphen', async () => {
    const value = await getLang('enenene')
    expect(value).toBe('enenene')
  })
  it('Throws language length is zero after hyphen slice', async () => {
    try {
      await getLang('-region')
      throw new Error('')
    } catch (error) {
      expect(error).toEqual({ code: 500, message: 'Locale is not standard length of 2 or 5' })
    }
  })
  it('Throws if empty string', async () => {
    try {
      await getLang('')
      throw new Error('')
    } catch (error) {
      expect(error).toEqual({ code: 500, message: 'Locale is not standard length of 2 or 5' })
    }
  })
  it('Throws if empty string of spaces', async () => {
    try {
      await getLang('                           ')
      throw new Error('')
    } catch (error) {
      expect(error).toEqual({ code: 500, message: 'Locale is not standard length of 2 or 5' })
    }
  })
  it('Returns the correct value given no hyphen and a bunch of spaces', async () => {
    const value = await getLang('     en')
    expect(value).toBe('en')
  })
  it('Returns the correct value given a hyphen, but spaces around lang', async () => {
    const value = await getLang('   en   -ss')
    expect(value).toBe('en')
  })
})
