import { SlashCommandBuilder } from '@discordjs/builders'
import { unlink } from 'fs/promises'
import { addModifiers, buildTempFile } from '../util/'
import { CommandInteraction, MessageAttachment } from 'discord.js'
import { i18n } from '../plugins/'

export default {
	data: new SlashCommandBuilder()
		.setName('subtract')
		.setDescription('Subtracts multiple inputs')
		.addStringOption((option) =>
			option.setName('values')
				.setDescription('Each value you wish to subtract separated by a space, ex: 10 20 30 40')
				.setRequired(true))
		.addStringOption((option) =>
			option.setName('modifiers')
				.setDescription('Modifies the final with a given modified (+,-,*,/). Executes in the order provided, ex (+5-2*3)'))
		.addBooleanOption((option) =>
			option.setName('ephemeral')
				.setDescription('Hides the value for only you to see')),
	async execute(interaction: CommandInteraction) {
		let gFile
		const ephemeral = interaction.options.getBoolean('ephemeral') ?? false
		const modifiers = interaction.options.getString('modifiers') ?? ''
		const values = interaction.options.getString('values')!
		const nums = values.split(/\s+/).filter((element) => !isNaN(element))
		if (values === '') {
			return await interaction.reply({ content: i18n.__('valueNotEmpty'), ephemeral: true })
		}
		else if (!nums.length) {
			return await interaction.reply({ content: i18n.__('valueYesNumbers'), ephemeral: true })
		}
		else if (nums.length > Number.parseInt(process.env.MAX_SAFE_ARGS)) {
			console.warn(interaction)
			return await interaction.reply({ content: i18n.__('valueOverMaxSafeArgs'), ephemeral: true })
		}
		else {
			try {
				const obj = {
					total: Number.parseInt(nums[0]),
					value: Number.parseInt(nums[0]),
					modifiers: modifiers || null
				}
				nums.forEach((element, index) => {
					if (index !== 0) {
						element = Number.parseInt(element)
						obj.value = obj.value - element
						obj.total = obj.value
					}
				})
				if (modifiers) {
					obj.total = addModifiers(modifiers, obj.total)
				}
				else {
					delete obj.modifiers
				}
				const file = await buildTempFile(JSON.stringify(obj, null, 2))
				gFile = file
				const mFile = new MessageAttachment(file)
				return await interaction.reply({ content: i18n.__('totalIs', { value: obj.total.toLocaleString(interaction.locale) }), ephemeral, files: [mFile] })
			}
			catch (err: any) {
				console.error({ error: err, interaction })
				return await interaction.reply({ content: `${i18n.__('error')}: ${err.message}`, ephemeral: true })
			}
			finally {
				if (gFile != null) {
					unlink(gFile)
						.catch((err) => {
							console.error({ error: err, interaction })
						})
				}
			}
		}
	}
}
