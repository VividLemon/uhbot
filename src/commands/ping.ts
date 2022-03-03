import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction } from 'discord.js'
import { i18n } from '../plugins/'

export default {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with pong'),
  async execute (interaction: CommandInteraction): Promise<void> {
    await interaction.reply(i18n.__('pong'))
  }
}
