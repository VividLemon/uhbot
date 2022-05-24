import { SystemError } from '../error'
import { i18n } from '../plugins'
import { evaluate, format } from 'mathjs'

/**
 *
 * @param {string} modifiers
 * @param {number} value
 * @returns {Promise<number>} number
 */
export default (modifiers: string, value: number): Promise<number> => {
  return new Promise((resolve, reject) => {
    const regex = /^\d+([+|/|*|-]-?\d+)+$/
    const str = `${value}${modifiers}`
    const strNoSpace = str.replaceAll(/\s/g, '')
    const test = regex.test(strNoSpace)
    if (test === false) {
      reject(SystemError.badRequest(i18n.__('incorrectValuesModifiers')))
      return
    }
    const result = Number.parseFloat(format(evaluate(strNoSpace)))
    if (!Number.isFinite(result)) {
      reject(SystemError.badRequest(i18n.__('numberNotFinite')))
      return
    }
    return resolve(result)
  })
}
