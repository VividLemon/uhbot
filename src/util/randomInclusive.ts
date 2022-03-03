/**
 * @param {number} min
 * @param {number} max
 * @returns {Promise<number>} A min/max inclusive randomized number
 */
export default (min: number, max: number): Promise<number> => {
  return new Promise((resolve) => {
    const minimum = Math.ceil(min)
    const maximum = Math.floor(max)
    resolve(Math.floor(Math.random() * (maximum - minimum + 1) + minimum))
  })
}
