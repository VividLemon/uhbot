const { random } = require('lodash')
const addModifiers = require('./addModifiers').default
/**
 *
 * @param {{size: number, number: number, rerolls: number, explode: number, modifiers: string}} object
 * @returns {Promise<{total: number, rolls: Array<number>, modifieds: Array<number>, rerollsSafeHit: boolean, explodes: Array<number>, explodeSafeHit: boolean}>} {total: number, rolls: Array<number>, modifieds: Array<number>, rerollsSafeHit: boolean, explodes: Array<number>, explodeSafeHit: boolean}
 */
module.exports = ({ size, number, rerolls, explode, modifiers }) => {
	return new Promise((resolve, reject) => {
		try {
			let maxSafeExplode = Number.parseInt(process.env.MAX_SAFE_EXPLODE)
			let maxSafeRerolls = Number.parseInt(process.env.MAX_SAFE_REROLLS)
			const allRolls = []
			for (let i = 0; i < rerolls && maxSafeRerolls > 0; i++) {
				allRolls.push({
					total: 0,
					rolls: [],
					modifieds: [],
					rerollsSafeHit: false,
					explodes: [],
					explodeSafeHit: false
				})
				for (let x = 0; x < number; x++) {
					let roll = random(1, size)
					allRolls[i].rolls.push(roll)
					if (modifiers) {
						addModifiers(modifiers, roll)
							.then((resp) => {
								allRolls[i].modifieds.push(resp)
								allRolls[i].total = allRolls[i].total + resp
							})
							.catch((err) => reject(err))
					}
					else {
						allRolls[i].total = allRolls[i].total + roll
					}
					while (roll > explode && maxSafeExplode > 0) {
						roll = random(1, size)
						allRolls[i].explodes.push(roll)
						allRolls[i].total = allRolls[i].total + roll
						// does not add modifiers on explodes
						maxSafeExplode = maxSafeExplode - 1
					}
					// Check
					if (maxSafeExplode === 0) {
						allRolls[i].explodeSafeHit = true
					}
				}
				// Check
				maxSafeRerolls = maxSafeRerolls - 1
				if (maxSafeRerolls === 0) {
					allRolls[i].rerollsSafeHit = true
				}
			}
			resolve(allRolls)
		}
		catch (err) {
			reject(err)
		}
	})
}
