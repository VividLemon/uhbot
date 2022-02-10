const { sumBy } = require('lodash')
const addModifiers = require('./addModifiers')
/**
 *
 * @param {Array<{total: number}>} allRolls
 * @param {String} modifiers
 * @returns {Promise<{total: number, rolls: Array<any>}} {total: number, rolls: Array<any>}
 */
export default (allRolls: Array<{ total: number }>, modifiers: string): Promise<{ total: number; rolls: Array<any> }> => {
	return new Promise((resolve, reject) => {
		const arr: Array<{total: number}> = []
		allRolls.forEach((element) => {
			for (const [key, value] of Object.entries(element)) {
				if (Array.isArray(value) && value.length === 0) {
					delete element[key]
				}
				else if (value === false || value == null) {
					delete element[key]
				}
				else if (key === 'rerollsSafeHit' && value === true) {
					element[key] = 'Max rerolls hit. This is done to reduce server stress'
				}
				else if (key === 'explodeSafeHit' && value === true) {
					element[key] = 'Max explodes hit. This is done to reduce server stress'
				}
			}
			arr.push(element)
		})
		const sum = sumBy(allRolls, 'total')
		if (modifiers) {
			return resolve({
				total: addModifiers(modifiers, sum),
				value: sum,
				modifiers,
				rolls: arr
			})
		}
		resolve({
			total: sum,
			rolls: arr
		})
	})
}
