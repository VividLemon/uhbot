const { randomUUID } = require('crypto')
const { writeFile } = require('fs/promises')
const { tmpdir } = require('os')
const { join } = require('path')
/**
 * @async
 * @param {string} content
 * @returns {Promise<string>} path to file
 */
export default async (content: string): Promise<string> => {
	const path = join(tmpdir(), `${randomUUID()}.json`)
	await writeFile(path, content)
	return path
}
