import { randomUUID } from 'node:crypto'
import { writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
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
