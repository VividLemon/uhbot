import { buildTempFile } from '../src/util'

describe('build-temp-file', () => {
  it('does', async () => {
    jest.mock('writeFile', () => {})
    const value = await buildTempFile('a')
    expect(value).toBe('abc')
  })
})
