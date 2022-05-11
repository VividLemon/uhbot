import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction } from 'discord.js'
import { i18n } from '../plugins/'
import { format, rationalize } from 'mathjs'
import { SystemError } from '../error'

export default {
  data: new SlashCommandBuilder()
    .setName('rationalize')
    .setDescription('Rationalizes a given algebraic imput')
    .addStringOption((option) =>
      option.setName('values')
        .setDescription('The equation you wish to rationalize')
        .setRequired(true))
    .addBooleanOption((option) =>
      option.setName('ephemeral')
        .setDescription('Hides the value for only you to see')),
  async execute (interaction: CommandInteraction): Promise<void> {
    // Essential
    const values = interaction.options.getString('values')
    if (values == null) { throw SystemError.valueNotSet() }
    // Non-essential
    const ephemeral = interaction.options.getBoolean('ephemeral') ?? false

    if (values.trim() === '') {
      return await interaction.reply({ content: i18n.__('valueNotEmpty'), ephemeral: true })
    }
    const result = format(rationalize(values.replaceAll(/\s/g, '')))
    await interaction.reply({ content: `${i18n.__('rationalized')} ${result}`, ephemeral })
  }
}
