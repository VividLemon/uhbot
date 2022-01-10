const { randomUUID } = require('crypto')
const { writeFile } = require('fs/promises')
const { join } = require('path')
/**
 * @async
 * @param {string} content
 * @returns {string} path to file
 */
module.exports = async (content) => {
	const pathToFile = join(__dirname, '../', '/tmp', `${randomUUID()}.tmp.json`)
	await writeFile(pathToFile, content)
	return pathToFile
}
