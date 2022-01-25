const Keyv = require('keyv')

// Important! Must have redis container
const keyv = new Keyv(`redis://user:${process.env.REDIS_PASSWORD}@localhost:6379`)
keyv.on('error', (err) => console.error(`Keyv ${err}`))

module.exports = {
	keyv
}
