const Keyv = require('keyv')
const { join } = require('path')

// Important! Must have redis container
const path = join(process.cwd(), 'sqlite', 'challenges.sqlite')
console.log(path)
const keyv = new Keyv(`sqlite://${path}`)
keyv.on('error', (err) => console.error(`Keyv ${err}`))

module.exports = {
	keyv
}
