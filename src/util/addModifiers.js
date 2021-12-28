/**
 *
 * @param {string} string
 * @param {number} value
 * @returns {number} number
 */
module.exports = (modifiers, value) => {
	let modified = 0
	const regex = /[+|\-|*|x|/]\d+/g
	const match = modifiers.match(regex)
	if (match == null) throw new Error('Incorrect values in modifiers')
	if (match.length > process.env.MAX_SAFE_ARGS) {
		throw new Error('Value is over the maximum safe arguments limit. Why are you using this many arguments?')
	}
	match.forEach((string) => {
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
				throw new Error('Value cannot be 0 when dividing!')
			}
		}
		else if (type === '*' || type === 'x') {
			modified = value * modifier
		}
		else {
			throw new Error(`Unrecognized type of ${type}}`)
		}
	})
	return modified
}

