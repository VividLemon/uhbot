import { Client, Intents, Collection } from 'discord.js'
import { readdirSync } from 'fs'
import { join } from 'path'
import { getLang } from './util/'
import { i18n } from './plugins/'
import { APIMessageInteraction } from 'discord-api-types'
import { SystemErrorHandler } from './error'

const client = new Client({ intents: [Intents.FLAGS.GUILDS] })
client.commands = new Collection()
const commandFiles = readdirSync(join(__dirname, 'commands')).filter((file) => file.endsWith('.js'))
for (const file of commandFiles) {
  const path = join(__dirname, 'commands', file)
  import(path).then((command) => client.commands.set(command.default.data.name, command.default)).catch(() => process.exit(1))
}

client.once('ready', () => {
  client.user!.setActivity('/ slash commands', { type: 'WATCHING' })
  console.log('Ready')
})

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return
  const command = client.commands.get(interaction.commandName)
  try {
    i18n.setLocale(await getLang(interaction.locale))
    await command.execute(interaction)
  } catch (error: unknown) {
    SystemErrorHandler(error, interaction)
  }
})

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return
  if (interaction.message.interaction == null) return
  if ((interaction.message.interaction as unknown as APIMessageInteraction)?.name == null) return
  const command = client.commands.get((interaction.message.interaction as unknown as APIMessageInteraction).name)
  try {
    i18n.setLocale(await getLang(interaction.locale))
    await command.buttonExecute(interaction)
  } catch (error: unknown) {
    SystemErrorHandler(error, interaction)
  }
})

client.login(process.env.TOKEN)
