import { AddHop } from 'uhbot'

/**
 *
 * @param {number} skill
 * @param {number} hops
 * @returns {Promise<AddHop>} {oldSkill, newSkill, hopsRemaining}
 */
export default (skill: number, hops: number): Promise<AddHop> => {
  return new Promise((resolve, reject) => {
    let oldSkillPlus = skill
    let hopsUsed = hops
    while (hopsUsed > 0) {
      if (Math.floor(oldSkillPlus % 10) === 9) {
        hopsUsed = hopsUsed - Math.ceil(oldSkillPlus / 10)
      } else {
        let div = Math.floor(oldSkillPlus / 10)
        if (div === 0) {
          div = 1
        }
        hopsUsed = hopsUsed - div
      }
      if (hopsUsed >= 0) {
        oldSkillPlus = oldSkillPlus + 1
        hops = hopsUsed
      }
    }
    const obj: AddHop = {
      oldSkill: skill,
      newSkill: oldSkillPlus,
      hopsRemaining: hops
    }
    resolve(obj)
  })
}
