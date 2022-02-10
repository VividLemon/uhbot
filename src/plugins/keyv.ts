import Keyv from 'keyv'
import { join } from 'path'

const path = join(process.cwd(), 'sqlite', 'challenges.sqlite')
export default new Keyv(`sqlite://${path}`)
