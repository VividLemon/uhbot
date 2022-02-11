import { randomUUID } from 'crypto'
import { writeFile } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'
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
