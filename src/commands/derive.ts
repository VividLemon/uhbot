import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction } from 'discord.js'
import { i18n } from '../plugins/'
import { derivative, format } from 'mathjs'
import { SystemError } from '../error'

export default {
  data: new SlashCommandBuilder()
    .setName('derive')
    .setDescription('Derivces a given algebraic imput')
    .addStringOption((option) =>
      option.setName('values')
        .setDescription('The equation you wish to derivce')
        .setRequired(true))
    .addStringOption((option) =>
      option.setName('by')
        .setDescription('The variable you wish to derive by')
        .setRequired(true))
    .addBooleanOption((option) =>
      option.setName('ephemeral')
        .setDescription('Hides the value for only you to see')),
  async execute (interaction: CommandInteraction): Promise<void> {
    // Essential
    const values = interaction.options.getString('values')
    const by = interaction.options.getString('by')
    if (values == null || by == null) { throw SystemError.valueNotSet() }
    // Non-essential
    const ephemeral = interaction.options.getBoolean('ephemeral') ?? false

    if (values.trim() === '') {
      return await interaction.reply({ content: i18n.__('valueNotEmpty'), ephemeral: true })
    }
    const result = format(derivative(values.replaceAll(/\s/g, ''), by))
    await interaction.reply({ content: `${i18n.__('derived')} ${result}`, ephemeral })
  }
}
