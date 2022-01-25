const { SlashCommandBuilder } = require('@discordjs/builders')
const { addModifiers, buildTempFile } = require('../util/')
const { unlink } = require('fs/promises')
const { MessageAttachment } = require('discord.js')

module.exports = {
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
	async execute(interaction) {
		const { i18n } = require('../plugins/')
		let gFile
		const number = interaction.options.getInteger('number')
		const size = interaction.options.getInteger('size')
		const ephemeral = interaction.options.getBoolean('ephemeral') ?? false
		const modifiers = interaction.options.getString('modifiers') ?? ''
		const rerolls = interaction.options.getInteger('rerolls') ?? 1
		if (size < 1) {
			return await interaction.reply({ content: i18n.__('sizeNegativeOrZero'), ephemeral: true })
		}
		else if (number < 1) {
			return await interaction.reply({ content: i18n.__('numberNegativeOrZero'), ephemeral: true })
		}
		else if (rerolls < 1) {
			return await interaction.reply({ content: 'Rerolls cannot be negative or zero', ephemeral: true })
		}
		else if (rerolls >= Math.floor(Number.parseInt(process.env.MAX_SAFE_REROLLS))) {
			return await interaction.reply({ content: i18n.__('rerollsLessThan', { value: Math.floor(Number.parseInt(process.env.MAX_SAFE_REROLLS)) }), ephemeral: true })
		}
		else {
			try {
				const avg = Math.round(((size + 1) / 2) * (number))
				const avgs = avg * rerolls
				const obj = {
					total: avgs,
					averages: avgs,
					modifiers
				}
				if (modifiers) {
					obj.total = addModifiers(modifiers, avg) * rerolls
				}
				else {
					delete obj.modifiers
				}
				const file = await buildTempFile(JSON.stringify(obj, null, 2))
				gFile = file
				const mFile = new MessageAttachment(file)
				return await interaction.reply({ content: i18n.__('totalIs', { value: obj.total.toLocaleString(interaction.locale) }), ephemeral, files: [mFile] })
			}
			catch (err) {
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
