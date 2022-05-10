import { SlashCommandBuilder } from '@discordjs/builders'
import { buildTempFile, roll, rollsWriteContent } from '../util/'
import { unlink } from 'fs/promises'
import { CommandInteraction, MessageAttachment } from 'discord.js'
import { i18n } from '../plugins/'

export default {
  data: new SlashCommandBuilder()
    .setName('roll-one')
    .setDescription('Rolls one die')
    .addIntegerOption((option) =>
      option.setName('size')
        .setDescription('Size of the die')
        .setRequired(true))
    .addStringOption((option) =>
      option.setName('modifiers')
        .setDescription('Modifies the final with a given modified (+,-,*,/). Executes left to right, ex (+5-2*3)'))
    .addStringOption((option) =>
      option.setName('dice-modifiers')
        .setDescription('Modifies each dice roll with a given modifier. Explodes excluded. Executes left to right'))
    .addIntegerOption((option) =>
      option.setName('explode')
        .setDescription('Causes a reroll when the roll value hits or exceeds target'))
    .addIntegerOption((option) =>
      option.setName('rerolls')
        .setDescription('Rerolls the die x amount of times'))
    .addBooleanOption((option) =>
      option.setName('ephemeral')
        .setDescription('Hides the value for only you to see')),
  async execute (interaction: CommandInteraction): Promise<void> {
    const size = interaction.options.getInteger('size')!
    const rerolls = interaction.options.getInteger('rerolls') ?? 1
    const ephemeral = interaction.options.getBoolean('ephemeral') ?? false
    const explode = interaction.options.getInteger('explode') ?? size + 1
    const modifiers = interaction.options.getString('modifiers') ?? ''
    const diceModifiers = interaction.options.getString('dice-modifiers') ?? ''
    if (size < 1) {
      return await interaction.reply({ content: i18n.__('sizeNegativeOrZero'), ephemeral: true })
    } else if (explode > size + 1) {
      return await interaction.reply({ content: i18n.__('explodeOverValue'), ephemeral: true })
    } else if (rerolls < 1) {
      return await interaction.reply({ content: i18n.__('rerollsNegativeOrZero'), ephemeral: true })
    } else if (rerolls >= Math.floor(Number.parseInt(process.env.MAX_SAFE_REROLLS!) / 10)) {
      return await interaction.reply({ content: i18n.__('rerollsLessThan', { value: Math.floor(Number.parseInt(process.env.MAX_SAFE_REROLLS!) / 10).toLocaleString(interaction.locale) }), ephemeral: true })
    }
    const obj = await roll({ size, number: 1, rerolls, explode, diceModifiers })
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
