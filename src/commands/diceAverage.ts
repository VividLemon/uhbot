import { SlashCommandBuilder } from '@discordjs/builders'
import { addModifiers, buildTempFile } from '../util/'
import { unlink } from 'fs/promises'
import { CommandInteraction, MessageAttachment } from 'discord.js'
import { i18n } from '../plugins/'
import { PEMObject } from 'uhbot'

export default {
  data: new SlashCommandBuilder()
    .setName('dice-average')
    .setDescription('Gets the expected average of dice')
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
        .setDescription('Modifies the final with a given modified (+,-,*,/). Executes in the order provided, ex (+5-2*3)'))
    .addIntegerOption((option) =>
      option.setName('rerolls')
        .setDescription('Rerolls the same size and number of dice x amount of times'))
    .addBooleanOption((option) =>
      option.setName('ephemeral')
        .setDescription('Hides the value for only you to see')),
  async execute (interaction: CommandInteraction): Promise<void> {
    const number = interaction.options.getInteger('number')!
    const size = interaction.options.getInteger('size')!
    const ephemeral = interaction.options.getBoolean('ephemeral') ?? false
    const modifiers = interaction.options.getString('modifiers') ?? ''
    const rerolls = interaction.options.getInteger('rerolls') ?? 1
    if (size < 1) {
      return await interaction.reply({ content: i18n.__('sizeNegativeOrZero'), ephemeral: true })
    } else if (number < 1) {
      return await interaction.reply({ content: i18n.__('numberNegativeOrZero'), ephemeral: true })
    } else if (rerolls < 1) {
      return await interaction.reply({ content: 'Rerolls cannot be negative or zero', ephemeral: true })
    } else if (rerolls >= Math.floor(Number.parseInt(process.env.MAX_SAFE_REROLLS!))) {
      return await interaction.reply({ content: i18n.__('rerollsLessThan', { value: Math.floor(Number.parseInt(process.env.MAX_SAFE_REROLLS!)).toLocaleString(interaction.locale) }), ephemeral: true })
    }
    const avg = Math.round(((size + 1) / 2) * (number))
    const avgs = avg * rerolls
    const obj: PEMObject = {
      total: avgs,
      value: avgs,
      modifiers
    }
    if (modifiers) {
      obj.total = await addModifiers(modifiers, avg) * rerolls
    } else {
      delete obj.modifiers
    }
    const file = await buildTempFile(JSON.stringify(obj, null, 2))
    const mFile = new MessageAttachment(file)
    await interaction.reply({ content: i18n.__('totalIs', { value: obj.total.toLocaleString(interaction.locale) }), ephemeral, files: [mFile] })
    unlink(file)
      .catch((error) => {
        console.error({ error, interaction })
      })
  }
}
