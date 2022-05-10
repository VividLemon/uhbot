import { SystemError } from '../error'
import { i18n } from '../plugins'
import { evaluate } from 'mathjs'

/**
 *
 * @param {string} string
 * @param {number} value
 * @returns {Promise<number>} number
 */
export default (modifiers: string, value: number): Promise<number> => {
  return new Promise((resolve, reject) => {
    const regex = /^\d+([+|/|*|-]-?\d+)+$/
    const modifiersNoSpace = modifiers.replaceAll(/\s/g, '')
    const test = regex.test(modifiersNoSpace)
    if (test === false) {
      return reject(SystemError.badRequest(i18n.__('incorrectValuesModifiers')))
    }
    const result = Number.parseFloat(evaluate(`${value} ${modifiersNoSpace}`))
    return resolve(result)
  })
}
