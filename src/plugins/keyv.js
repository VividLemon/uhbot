const Keyv = require('keyv')
const { join } = require('path')

const path = join(process.cwd(), 'sqlite', 'challenges.sqlite')
const keyv = new Keyv(`sqlite://${path}`)
keyv.on('error', (err) => console.error(`Keyv ${err}`))

module.exports = keyv
