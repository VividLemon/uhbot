import { REST } from '@discordjs/rest'
import { Routes } from 'discord-api-types/v9'
import { readdirSync } from 'fs'
import { join } from 'path'
import 'dotenv/config'
import { SystemError } from './error'

const commands: Array<unknown> = []
const commandFiles = readdirSync(join(__dirname, 'commands')).filter((file) => file.endsWith('.js'))
for (const file of commandFiles) {
  const path = join(__dirname, 'commands', file)
  import(path).then((command) => commands.push(command.default.data.toJSON())).catch(() => process.exit(1))
}
if (process.env.TOKEN == null) { process.exit(1) }
const rest = new REST({ version: '9' }).setToken(process.env.TOKEN)

const activate = async () => {
  try {
    if (process.env.CLIENT == null || process.env.GUILD == null) { throw SystemError.environmentNotSet() }
    console.log('Started refreshing guild (/) commands.')
    await rest.put(Routes.applicationGuildCommands(process.env.CLIENT, process.env.GUILD), { body: commands })
    console.log('Successfully reloaded guild (/) commands')
    console.log('Started refreshing application (/) commands')
    await rest.put(Routes.applicationCommands(process.env.CLIENT), { body: commands })
    console.log('Successfully reloaded application (/) commands')
  } catch (error: unknown) {
    console.error(error)
  }
}
activate()
