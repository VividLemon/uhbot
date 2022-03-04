import { ApiError } from '../error'
import { i18n } from '../plugins'

/**
 * @description Cuts down the locale to what i18n can recognize -- length of 2
 * @param {string} locale in either en form or en-US form
 * @returns {promise<string>} slices locale down to 2
 */
export default (locale: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (locale.length > 2) {
      resolve(locale.slice(0, 2))
    } else if (locale.length === 2) {
      resolve(locale)
    } else {
      reject(ApiError.internal(i18n.__('localNotStandard')))
    }
  })
}
