/**
 *
 * @param {number} from
 * @param {number} to
 * @returns {Promise<number>} number
 */
export default (from: number, to: number): Promise<number> => {
	return new Promise((resolve, reject) => {
		const difference = to - from
		let oldSkillPlus = from
		let total = 0
		for (let i = 0; i < difference; i++) {
			if (Math.floor(oldSkillPlus % 10) === 9) {
				total = total + Math.ceil(oldSkillPlus / 10)
			}
			else {
				let div = Math.floor(oldSkillPlus / 10)
				if (div === 0) {
					div = 1
				}
				total = total + div
			}
			oldSkillPlus = oldSkillPlus + 1
		}
		return resolve(total)
	})
}
