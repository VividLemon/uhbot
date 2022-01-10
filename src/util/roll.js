const { random } = require('lodash')
const addModifiers = require('./addModifiers')
/**
 *
 * @param {{size: number, number: number, rerolls: number, explode: number, modifiers: string}} object
 * @returns {Promise<{total: number, rolls: Array<number>, modifieds: Array<number>, rerollsSafeHit: boolean, explodes: Array<number>, explodeSafeHit: boolean}>} {total: number, rolls: Array<number>, modifieds: Array<number>, rerollsSafeHit: boolean, explodes: Array<number>, explodeSafeHit: boolean}
 */
module.exports = ({ size, number, rerolls, explode, diceModifiers }) => {
	return new Promise((resolve, reject) => {
		let maxSafeExplode = Number.parseInt(process.env.MAX_SAFE_EXPLODE)
		let maxSafeRerolls = Number.parseInt(process.env.MAX_SAFE_REROLLS)
		const allRolls = []
		for (let i = 0; i < rerolls && maxSafeRerolls > 0; i++) {
			allRolls.push({
				total: 0,
				value: 0,
				modifiers: diceModifiers || null,
				rerollsSafeHit: false,
				explodeSafeHit: false,
				rolls: [],
				modifieds: [],
				explodes: []
			})
			const curr = allRolls[i]
			for (let x = 0; x < number; x++) {
				let roll = random(1, size)
				curr.rolls.push(roll)
				if (diceModifiers) {
					const added = addModifiers(diceModifiers, roll)
					curr.modifieds.push(added)
					curr.value = curr.value + roll
					curr.total = curr.total + added
				}
				else {
					delete curr.value
					curr.total = curr.total + roll
				}
				while (roll > explode && maxSafeExplode > 0) {
					roll = random(1, size)
					curr.explodes.push(roll)
					curr.total = curr.total + roll
					// does not add modifiers on explodes
					maxSafeExplode = maxSafeExplode - 1
				}
				// Check
				if (maxSafeExplode === 0) {
					curr.explodeSafeHit = true
				}
			}
			// Check
			maxSafeRerolls = maxSafeRerolls - 1
			if (maxSafeRerolls === 0) {
				curr.rerollsSafeHit = true
			}
		}
		resolve(allRolls)
	})
}