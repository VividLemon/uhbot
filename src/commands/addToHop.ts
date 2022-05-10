import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction } from 'discord.js'
import { addToHop } from '../util/'
import { i18n } from '../plugins/'
import { SystemError } from '../error'

export default {
  data: new SlashCommandBuilder()
    .setName('add-to-hop')
    .setDescription('Returns the skill you can achieve with x amount of hops')
    .addIntegerOption((option) =>
      option.setName('skill')
        .setDescription('The skill you\'re starting at')
        .setRequired(true))
    .addIntegerOption((option) =>
      option.setName('hops')
        .setDescription('How many hops you have to spend')
        .setRequired(true))
    .addBooleanOption((option) =>
      option.setName('ephemeral')
        .setDescription('Hides the value for only you to see')),
  async execute (interaction: CommandInteraction): Promise<void> {
    // Essential
    const skill = interaction.options.getInteger('skill')
    const hops = interaction.options.getInteger('hops')
    if (skill == null || hops == null) { throw SystemError.valueNotSet() }
    // Non-essential
    const ephemeral = interaction.options.getBoolean('ephemeral') ?? false

    if (skill < 0) {
      return await interaction.reply({ content: i18n.__('skillNotNegative'), ephemeral: true })
    }
    if (hops <= 0) {
      return await interaction.reply({ content: i18n.__('hopsNotNegative'), ephemeral: true })
    }
    const obj = await addToHop(skill, hops)
    let content = `${i18n.__('canGetToSkill')}: ${obj.newSkill.toLocaleString(interaction.locale)}`
    content = `${content}\n${i18n.__('startingAtLevel')}: ${obj.oldSkill.toLocaleString(interaction.locale)}`
    content = `${content}\n${i18n.__('with')} ${obj.hopsRemaining.toLocaleString(interaction.locale)} ${(Math.abs(obj.hopsRemaining) === 1) ? i18n.__n('hop', 1) : i18n.__n('hop', 2)} ${i18n.__('remaining')}`
    await interaction.reply({ content, ephemeral })
  }
}
