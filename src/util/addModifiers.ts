import { SystemError } from '../error'
import { i18n } from '../plugins'
import { evaluate, format } from 'mathjs'

/**
 *
 * @param {string} string
 * @param {number} value
 * @returns {Promise<number>} number
 */
export default (modifiers: string, value: number): Promise<number> => {
  return new Promise((resolve, reject) => {
    const regex = /^\d+([+|/|*|-]-?\d+)+$/
    const str = `${value}${modifiers}`
    const strNoSpace = str.replaceAll(/\s/g, '')
    const test = regex.test(strNoSpace)
    if (test === false) { return reject(SystemError.badRequest(i18n.__('incorrectValuesModifiers'))) }
    const result = Number.parseFloat(format(evaluate(strNoSpace)))
    return resolve(result)
  })
}
