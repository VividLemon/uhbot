/**
 *
 * @param {string} string
 * @param {number} value
 * @returns {Promise<number>} number
 */
module.exports = (modifiers, value) => {
	return new Promise((resolve, reject) => {
		try {
			let modified = 0
			const regex = /[+|\-|*|x|/]\d+/g
			modifiers.match(regex).forEach((string) => {
				const type = string.substring(0, 1)
				const modifier = parseInt(string.substring(1))
				if (type === '+') {
					modified = value + modifier
				}
				else if (type === '-') {
					modified = value - modifier
				}
				else if (type === '/') {
					if (modifier !== 0) {
						modified = value / modifier
					}
					else {
						return reject(new Error('Value cannot be 0 when dividing!'))
					}
				}
				else if (type === '*' || type === 'x') {
					modified = value * modifier
				}
				else {
					return reject(new Error(`Unrecognized type of ${type}}`))
				}
			})
			resolve(modified)
		}
		catch (err) {
			reject(err)
		}
	})
}
