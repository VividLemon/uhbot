const { Client, Intents, Collection } = require('discord.js')
const { readdirSync } = require('fs')
const { join } = require('path')
require('dotenv').config()

const client = new Client({ intents: [Intents.FLAGS.GUILDS] })

client.commands = new Collection()
const commandFiles = readdirSync('./commands').filter((file) => file.endsWith('.js'))
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
	try {
		await command.execute(interaction)
	}
	catch (error) {
		console.error(error)
		return await interaction.reply({ content: 'There was an error while trying to execute this command\nError was logged', ephemeral: true })
	}
})

client.login(process.env.TOKEN)
