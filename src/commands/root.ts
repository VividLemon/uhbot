import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction } from 'discord.js'
import { i18n } from '../plugins/'
import { sqrt } from 'mathjs'
import { SystemError } from '../error'

export default {
  data: new SlashCommandBuilder()
    .setName('root')
    .setDescription('Takes the square root of a number')
    .addStringOption((option) =>
      option.setName('number')
        .setDescription('The number you wish to take the root of')
        .setRequired(true))
    .addBooleanOption((option) =>
      option.setName('ephemeral')
        .setDescription('Hides the value for only you to see')),
  async execute (interaction: CommandInteraction): Promise<void> {
    // Essential
    const number = interaction.options.getString('number')
    if (number == null) { throw SystemError.valueNotSet() }
    // Non-essential
    const ephemeral = interaction.options.getBoolean('ephemeral') ?? false

    if (number.trim() === '') {
      return await interaction.reply({ content: i18n.__('valueNotEmpty'), ephemeral: true })
    }
    const result = sqrt(Number.parseFloat(number))
    await interaction.reply({ content: i18n.__('value', { value: result.toString() }), ephemeral })
  }
}
