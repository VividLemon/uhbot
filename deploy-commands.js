const { REST } = require('@discordjs/rest')
const { Routes } = require('discord-api-types/v9')
const { readdirSync } = require('fs')
const { join } = require('path')
require('dotenv').config()

const commands = []
const commandFiles = readdirSync('./commands').filter((file) => file.endsWith('.js'))
for (const file of commandFiles) {
	const path = join(__dirname, 'commands', file)
	const command = require(path)
	commands.push(command.data.toJSON())
}

const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);

(async () => {
	try {
		console.log('Started refreshing guild (/) commands.')
		await rest.put(
			Routes.applicationGuildCommands(process.env.CLIENT, process.env.GUILD),
			{ body: commands }
		)
		console.log('Successfully reloaded guild (/) commands')
		console.log('Started refreshing application (/) commands')
		await rest.put(
			Routes.applicationCommands(process.env.CLIENT),
			{ body: commands }
		)
		console.log('Successfully reloaded application (/) commands')
	}
	catch (err) {
		console.error(err)
	}
})()
