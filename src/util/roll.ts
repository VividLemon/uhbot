import { random } from 'lodash'
import { RollItems, RollReturns } from 'uhbot'
import { addModifiers } from './'

/**
 *
 * @param {RollItems}
 * @returns {Promise<RollReturns>}
 */
export default ({ size, number, rerolls, explode, diceModifiers }: RollItems): Promise<Array<RollReturns>> => {
  return new Promise((resolve, reject) => {
    let maxSafeExplode = Number.parseInt(process.env.MAX_SAFE_EXPLODE!)
    let maxSafeRerolls = Number.parseInt(process.env.MAX_SAFE_REROLLS!)
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
      // TODO fix this
      const curr = allRolls[i]
      for (let x = 0; x < number; x++) {
        let roll = random(1, size)
        curr.rolls.push(roll)
        if (diceModifiers) {
          const added = addModifiers(diceModifiers, roll)
          curr.modifieds.push(added)
          curr.value = curr.value + roll
          curr.total = curr.total + added
        } else {
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
