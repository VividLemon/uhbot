import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction } from 'discord.js'
import { i18n } from '../plugins/'
import { fraction } from 'mathjs'
import { SystemError } from '../error'

export default {
  data: new SlashCommandBuilder()
    .setName('fractionify')
    .setDescription('Converts the input to a fraction')
    .addStringOption((option) =>
      option.setName('value')
        .setDescription('The value you wish to convert to a fraction')
        .setRequired(true))
    .addBooleanOption((option) =>
      option.setName('ephemeral')
        .setDescription('Hides the value for only you to see')),
  async execute (interaction: CommandInteraction): Promise<void> {
    // Essential
    const value = interaction.options.getString('value')
    if (value == null) { throw SystemError.valueNotSet() }
    // Non-essential
    const ephemeral = interaction.options.getBoolean('ephemeral') ?? false

    if (value.trim() === '') {
      return await interaction.reply({ content: i18n.__('valueNotEmpty'), ephemeral: true })
    }
    const result = fraction(value)
    await interaction.reply({ content: i18n.__('simplified', { value: result.toString() }), ephemeral })
  }
}
