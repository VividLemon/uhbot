const { Client, Intents, Collection } = require('discord.js')
const { readdirSync } = require('fs')
const { join } = require('path')
const { getLang } = require('./util/')
const { i18n } = require('./plugins/')

const client = new Client({ intents: [Intents.FLAGS.GUILDS] })

client.commands = new Collection()
const commandFiles = readdirSync(join(__dirname, 'commands')).filter((file) => file.endsWith('.js'))
for (const file of commandFiles) {
	const path = join(__dirname, 'commands', file)
	const command = require(path)
	client.commands.set(command.data.name, command)
}

client.once('ready', () => {
	client.user.setActivity('/ slash commands', { type: 'WATCHING' })
	console.log('Ready')
})

client.on('interactionCreate', async (interaction) => {
	if (!interaction.isCommand()) return
	const command = client.commands.get(interaction.commandName)
	i18n.setLocale(await getLang(interaction.locale))
	try {
		await command.execute(interaction)
	}
	catch (err) {
		console.error({ error: err, interaction })
		return await interaction.reply({ content: 'There was an error while trying to execute this command\nError was logged', ephemeral: true })
	}
})

client.on('interactionCreate', async (interaction) => {
	if (!interaction.isButton()) return
	const command = client.commands.get(interaction.message.interaction.name)
	i18n.setLocale(await getLang(interaction.locale))
	try {
		await command.buttonExecute(interaction)
	}
	catch (err) {
		console.error({ error: err, interaction })
		return await interaction.reply({ content: 'There was an error while trying to execute this command\nError was logged', ephemeral: true })
	}
})

client.login(process.env.TOKEN)

