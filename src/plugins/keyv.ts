import Keyv from 'keyv'
import { join } from 'path'

export default new Keyv(`sqlite://${join(process.cwd(), 'sqlite', 'challenges.sqlite')}`)
