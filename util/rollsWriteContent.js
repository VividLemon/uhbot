const { sumBy } = require('lodash')
/**
 *
 * @param {Array<{total: number}>} allRolls
 * @returns {Promise<{total: number, rolls: Array<any>}} {total: number, rolls: Array<any>}
 */
module.exports = (allRolls) => {
	return new Promise((resolve, reject) => {
		try {
			const arr = []
			allRolls.forEach((element) => {
				for (const [key, value] of Object.entries(element)) {
					if (Array.isArray(value) && value.length === 0) {
						delete element[key]
					}
					else if (value === false || value == null) {
						delete element[key]
					}
				}
				arr.push(element)
			})
			const obj = {
				total: sumBy(allRolls, 'total'),
				rolls: arr
			}
			resolve(obj)
		}
		catch (err) {
			reject(err)
		}
	})
}
