const { randomUUID } = require('crypto')
const { writeFile } = require('fs/promises')
const { join } = require('path')
/**
 *
 * @param {string} content
 * @returns {Promise<string>} string of path to file
 */
module.exports = (content) => {
	return new Promise((resolve, reject) => {
		const pathToFile = join(__dirname, '../', '/tmp', `${randomUUID()}.tmp.json`)
		writeFile(pathToFile, content)
			.then(() => resolve(pathToFile))
			.catch((err) => reject(err))
	})
}
