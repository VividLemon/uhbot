import Keyv from 'keyv'
import { join } from 'node:path'

export default new Keyv(`sqlite://${join(process.cwd(), 'sqlite', 'challenges.sqlite')}`)
