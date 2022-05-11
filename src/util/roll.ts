import { randomInclusive } from '.'
import { RollItems, RollReturns } from 'uhbot'
import { addModifiers } from './'
import { SystemError } from '../error'

/**
 *
 * @param {RollItems}
 * @returns {Promise<RollReturns>}
 */
export default async ({ size, number, rerolls, explode, diceModifiers }: RollItems): Promise<Array<RollReturns>> => {
  if (process.env.MAX_SAFE_EXPLODE == null || process.env.MAX_SAFE_REROLLS == null) { throw SystemError.environmentNotSet() }
  let maxSafeExplode = Number.parseInt(process.env.MAX_SAFE_EXPLODE)
  let maxSafeRerolls = Number.parseInt(process.env.MAX_SAFE_REROLLS)
  const allRolls: Array<RollReturns> = []
  for (let i = 0; i < rerolls && maxSafeRerolls > 0; i++) {
    const curr: RollReturns = { total: 0, value: 0, modifiers: diceModifiers, rerollsSafeHit: false, explodeSafeHit: false, rolls: [], modifieds: [], explodes: [] }
    for (let x = 0; x < number; x++) {
      let roll = await randomInclusive(1, size)
      curr.rolls.push(roll)
      if (diceModifiers) {
        const added = await addModifiers(diceModifiers, roll)
        curr.modifieds.push(added)
        curr.value = (curr.value ?? 0) + roll
        curr.total = curr.total + added
      } else {
        delete curr.value
        curr.total = curr.total + roll
      }
      while (roll > explode && maxSafeExplode > 0) {
        roll = await randomInclusive(1, size)
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
    allRolls.push(curr)
  }
  return (allRolls)
}
