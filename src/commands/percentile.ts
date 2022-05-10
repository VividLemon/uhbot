import { SlashCommandBuilder } from '@discordjs/builders'
import { buildTempFile, roll, rollsWriteContent } from '../util/'
import { unlink } from 'fs/promises'
import { CommandInteraction, MessageAttachment } from 'discord.js'
import { i18n } from '../plugins/'
import { SystemError } from '../error'

export default {
  data: new SlashCommandBuilder()
    .setName('percentile')
    .setDescription('Roles a 100 sided die')
    .addStringOption((option) =>
      option.setName('modifiers')
        .setDescription('Modifies the final with a given modified (+,-,*,/)'))
    .addStringOption((option) =>
      option.setName('dice-modifiers')
        .setDescription('Modifies each dice roll with a given modifier. Explodes excluded'))
    .addIntegerOption((option) =>
      option.setName('explode')
        .setDescription('Causes a reroll when the roll value hits or exceeds target'))
    .addIntegerOption((option) =>
      option.setName('rerolls')
        .setDescription('Rerolls the percentile x number of times'))
    .addBooleanOption((option) =>
      option.setName('ephemeral')
        .setDescription('Hides the value for only you to see')),
  async execute (interaction: CommandInteraction): Promise<void> {
    // Non-essential
    const ephemeral = interaction.options.getBoolean('ephemeral') ?? false
    const explode = interaction.options.getInteger('explode') ?? 101
    const modifiers = interaction.options.getString('modifiers') ?? ''
    const diceModifiers = interaction.options.getString('dice-modifiers') ?? ''
    const rerolls = interaction.options.getInteger('rerolls') ?? 1
    if (process.env.MAX_SAFE_REROLLS == null) { throw SystemError.environmentNotSet() }

    if (explode < 1) {
      return await interaction.reply({ content: i18n.__('explodeNotZeroOrNegative'), ephemeral: true })
    }
    if (explode > 101) {
      return await interaction.reply({ content: i18n.__('explodeOverPercentile'), ephemeral: true })
    }
    if (rerolls < 1) {
      return await interaction.reply({ content: i18n.__('rerollsNegativeOrZero'), ephemeral: true })
    }
    if (rerolls >= Math.floor(Number.parseInt(process.env.MAX_SAFE_REROLLS) / 10)) {
      return await interaction.reply({ content: i18n.__('rerollsLessThan', { value: Math.floor(Number.parseInt(process.env.MAX_SAFE_REROLLS) / 10).toLocaleString(interaction.locale) }), ephemeral: true })
    }
    const obj = await roll({ size: 100, number: 1, rerolls, explode, diceModifiers })
    const content = await rollsWriteContent(obj, modifiers)
    const file = await buildTempFile(JSON.stringify(content, null, 2))
    const mFile = new MessageAttachment(file)
    await interaction.reply({ content: i18n.__('totalIs', { value: content.total.toLocaleString(interaction.locale) }), ephemeral, files: [mFile] })
    unlink(file)
      .catch((error) => {
        console.error({ error, interaction })
      })
  }
}
