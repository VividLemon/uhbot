import { SlashCommandBuilder } from '@discordjs/builders'
import { buildTempFile, roll, rollsWriteContent } from '../util/'
import { unlink } from 'node:fs/promises'
import { CommandInteraction, MessageAttachment } from 'discord.js'
import { i18n } from '../plugins/'
import { SystemError } from '../error'

export default {
  data: new SlashCommandBuilder()
    .setName('roll')
    .setDescription('Rolls dice')
    .addIntegerOption((option) =>
      option.setName('size')
        .setDescription('Size of each die')
        .setRequired(true))
    .addIntegerOption((option) =>
      option.setName('number')
        .setDescription('How many of each die')
        .setRequired(true))
    .addStringOption((option) =>
      option.setName('modifiers')
        .setDescription('Modifies the final with a given modified (+,-,*,/)'))
    .addStringOption((option) =>
      option.setName('dice-modifiers')
        .setDescription('Modifies each dice roll with a given modifier. Explodes excluded. Executes left to right'))
    .addIntegerOption((option) =>
      option.setName('explode')
        .setDescription('Causes a reroll when the roll value hits or exceeds target'))
    .addIntegerOption((option) =>
      option.setName('rerolls')
        .setDescription('Rerolls the same size and number of dice x amount of times'))
    .addBooleanOption((option) =>
      option.setName('ephemeral')
        .setDescription('Hides the value for only you to see')),
  async execute (interaction: CommandInteraction): Promise<void> {
    // Essential
    const number = interaction.options.getInteger('number')
    const size = interaction.options.getInteger('size')
    if (number == null || size == null) { throw SystemError.valueNotSet() }
    if (process.env.MAX_SAFE_REROLLS == null) { throw SystemError.environmentNotSet() }
    // Non-essential
    const ephemeral = interaction.options.getBoolean('ephemeral') ?? false
    const explode = interaction.options.getInteger('explode') ?? size + 1
    const modifiers = interaction.options.getString('modifiers') ?? ''
    const diceModifiers = interaction.options.getString('dice-modifiers') ?? ''
    const rerolls = interaction.options.getInteger('rerolls') ?? 1

    if (size < 1) {
      return await interaction.reply({ content: i18n.__('sizeNegativeOrZero'), ephemeral: true })
    }
    if (number < 1) {
      return await interaction.reply({ content: i18n.__('numberNegativeOrZero'), ephemeral: true })
    }
    if (explode > size + 1) {
      return await interaction.reply({ content: i18n.__('explodeOverValue'), ephemeral: true })
    }
    if (rerolls < 1) {
      return await interaction.reply({ content: i18n.__('rerollsNegativeOrZero'), ephemeral: true })
    }
    if (rerolls >= Math.floor(Number.parseInt(process.env.MAX_SAFE_REROLLS) / 10)) {
      return await interaction.reply({ content: i18n.__('rerollsLessThan', { value: Math.floor(Number.parseInt(process.env.MAX_SAFE_REROLLS) / 10).toLocaleString(interaction.locale) }), ephemeral: true })
    }
    const obj = await roll({ size, number, rerolls, explode, diceModifiers })
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
