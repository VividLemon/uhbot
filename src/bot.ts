import { Client, Intents, Collection } from 'discord.js'
import { readdirSync } from 'fs'
import { join } from 'path'
import { getLang } from './util/'
import { i18n } from './plugins/'
import { APIMessageInteraction } from 'discord-api-types'

const client = new Client({ intents: [Intents.FLAGS.GUILDS] })
// TODO test everything!!!
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
  } catch (err: any) {
    console.error({ error: err, interaction })
    return await interaction.reply({ content: 'There was an error while trying to execute this command\nError was logged', ephemeral: true })
  }
})

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return
  // TODO fix this
  const command = client.commands.get((interaction.message.interaction! as any as APIMessageInteraction).name)
  i18n.setLocale(await getLang(interaction.locale))
  try {
    await command.buttonExecute(interaction)
  } catch (err: any) {
    console.error({ error: err, interaction })
    return await interaction.reply({ content: 'There was an error while trying to execute this command\nError was logged', ephemeral: true })
  }
})

client.login(process.env.TOKEN)
