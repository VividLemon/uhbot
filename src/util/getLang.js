/**
 * @description Cuts down the locale to what i18n can recognize -- length of 2
 * @param {string} locale in either en form or en-US form
 * @returns {promise<string>} slices locale down to 2
 */
module.exports = (locale) => {
	return new Promise((resolve, reject) => {
		if (locale.length > 2) {
			resolve(locale.slice(0, 2))
		}
		else if (locale.length === 2) {
			resolve(locale)
		}
		else {
			reject(new Error('Locale is not standard length of 2 or 5'))
		}
	})
}
