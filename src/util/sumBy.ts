/**
 * @param {Array<any>} array of objects to loop through
 * @param {string} value of iteree to sumby
 */
export default (array: Array<any>, value: string): Promise<number> => {
  return new Promise((resolve) => {
    const sum: number = array.reduce((total, el) => {
      if (!el[value]) {
        return total
      }
      return total + el[value]
    }, 0)
    resolve(sum)
  })
}
