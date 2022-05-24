import { SystemError } from '../error'
import { i18n } from '../plugins'

/**
 * @description Cuts down the locale to what i18n can recognize -- length of 2
 * @param {string} locale in either en form or en-US form
 * @returns {promise<string>} slices locale down to 2
 */
export default (locale: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const local = locale.trim()
    if (local.length === 0) {
      reject(SystemError.internal(i18n.__('localeNotStandard')))
      return
    }
    const split = local.split('-')
    const [lang] = split
    if (split.length === 2) {
      const trimmed = lang.trim()
      if (trimmed.length === 0) {
        reject(SystemError.internal(i18n.__('localeNotStandard')))
        return
      }
      resolve(trimmed)
      return
    }
    resolve(lang)
  })
}
