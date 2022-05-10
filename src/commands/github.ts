import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction } from 'discord.js'

export default {
  data: new SlashCommandBuilder()
    .setName('github')
    .setDescription('Sends the github repository'),
  async execute (interaction: CommandInteraction): Promise<void> {
    await interaction.reply({ content: process.env.GITHUB_LINK ?? 'https://github.com/kwiksilver3441/uhbot', ephemeral: true })
  }
}
