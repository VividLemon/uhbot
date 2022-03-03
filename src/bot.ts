import { Client, Intents, Collection } from 'discord.js'
import { readdirSync } from 'fs'
import { join } from 'path'
import { getLang } from './util/'
import { i18n } from './plugins/'
import { APIMessageInteraction } from 'discord-api-types'

const client = new Client({ intents: [Intents.FLAGS.GUILDS] })
client.commands = new Collection()
const commandFiles = readdirSync(join(__dirname, 'commands')).filter((file) => file.endsWith('.js'))
for (const file of commandFiles) {
  const path = join(__dirname, 'commands', file)
  import(path).then((command) => client.commands.set(command.default.data.name, command.default))
}

client.once('ready', () => {
client.user!.setActivity('/ slash commands', { type: 'WATCHING' })
console.log('Ready')
})

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return
  const command = client.commands.get(interaction.commandName)
  i18n.setLocale(await getLang(interaction.locale))
  try {
    await command.execute(interaction)
  } catch (error: unknown) {
    console.error({ error, interaction })
    return await interaction.reply({ content: i18n.__('errorWasLogged'), ephemeral: true })
  }
})

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return
  if (interaction.message.interaction == null) return
  const command = client.commands.get((interaction.message.interaction as unknown as APIMessageInteraction).name)
  i18n.setLocale(await getLang(interaction.locale))
  try {
    await command.buttonExecute(interaction)
  } catch (error: unknown) {
    console.error({ error, interaction })
    // TODO perhaps make an error class that can contain information about the error. While also obscuring internal issues
    return await interaction.reply({ content: i18n.__('errorWasLogged'), ephemeral: true })
  }
})

client.login(process.env.TOKEN)
