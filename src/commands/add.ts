import { SlashCommandBuilder } from '@discordjs/builders'
import { unlink } from 'fs/promises'
import { addModifiers, buildTempFile } from '../util/'
import { CommandInteraction, MessageAttachment } from 'discord.js'
import { i18n } from '../plugins/'
import { PEMObject } from 'uhbot'

export default {
  data: new SlashCommandBuilder()
    .setName('add')
    .setDescription('Adds multiple inputs')
    .addStringOption((option) =>
      option.setName('values')
        .setDescription('Each value you wish to add separated by a space, ex: 10 20 30 40')
        .setRequired(true))
    .addStringOption((option) =>
      option.setName('modifiers')
        .setDescription('Modifies the final with a given modified (+,-,*,/). Executes in the order provided, ex (+5-2*3)'))
    .addBooleanOption((option) =>
      option.setName('ephemeral')
        .setDescription('Hides the value for only you to see')),
  async execute (interaction: CommandInteraction): Promise<void> {
    const ephemeral = interaction.options.getBoolean('ephemeral') ?? false
    const modifiers = interaction.options.getString('modifiers') ?? ''
    const values = interaction.options.getString('values')!
    const nums = values.split(/\s+/).filter((element) => !Number.isNaN(element))
    if (values.trim() === '') {
      return await interaction.reply({ content: i18n.__('valueNotEmpty'), ephemeral: true })
    } else if (!nums.length) {
      return await interaction.reply({ content: i18n.__('valueYesNumbers'), ephemeral: true })
    } else if (nums.length > Number.parseInt(process.env.MAX_SAFE_ARGS!)) {
      console.warn(interaction)
      return await interaction.reply({ content: i18n.__('valueOverMaxSafeArgs'), ephemeral: true })
    }
    const obj: PEMObject = nums.reduce((total, el) => {
      const value = Number.parseInt(el) + total.value
      return { value, total: value, modifiers: modifiers || undefined }
    }, { value: 0, total: 0, modifiers: modifiers || undefined })
    if (modifiers) {
      obj.total = await addModifiers(modifiers, obj.total)
    } else {
      delete obj.modifiers
    }
    const file = await buildTempFile(JSON.stringify(obj, null, 2))
    const mFile = new MessageAttachment(file)
    await interaction.reply({ content: i18n.__('totalIs', { value: obj.total.toLocaleString(interaction.locale) }), ephemeral, files: [mFile] })
    unlink(file)
      .catch((error: unknown) => {
        console.error({ error, interaction })
      })
  }
}
