import { sumBy } from '.'
import { RollsWrittenContent } from 'uhbot'
import addModifiers from './addModifiers'
/**
 *
 * @param {Array<any>} allRolls
 * @param {String} modifiers
 * @returns {Promise<RollsWrittenContent}
 */
export default async (allRolls: Array<any>, modifiers: string): Promise<RollsWrittenContent> => {
  const arr: Array<{total: number}> = []
  allRolls.forEach((element) => {
    for (const [key, value] of Object.entries(element)) {
      if (Array.isArray(value) && value.length === 0) {
        delete element[key]
      } else if (value === false || value == null) {
        delete element[key]
      } else if (typeof value === 'string' && value.trim() === '') {
        delete element[key]
      } else if (key === 'rerollsSafeHit' && value === true) {
        element[key] = 'Max rerolls hit. This is done to reduce server stress'
      } else if (key === 'explodeSafeHit' && value === true) {
        element[key] = 'Max explodes hit. This is done to reduce server stress'
      }
    }
    arr.push(element)
  })
  const sum = await sumBy(allRolls, 'total')
  if (modifiers) {
    return {
      total: await addModifiers(modifiers, sum),
      value: sum,
      modifiers,
      rolls: arr
    }
  }
  return {
    total: sum,
    rolls: arr
  }
}
