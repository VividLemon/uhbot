const { SlashCommandBuilder } = require('@discordjs/builders')
const { buildTempFile, roll, rollsWriteContent } = require('../util/')
const { unlink } = require('fs/promises')
const { MessageAttachment } = require('discord.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('percentile')
		.setDescription('Roles a 100 sided die')
		.addStringOption((option) =>
			option.setName('modifiers')
				.setDescription('Modifies the final with a given modified (+,-,*,/). Executes in the order provided, ex (+5-2*3)'))
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
	async execute(interaction) {
		const { i18n } = require('../plugins/')
		let gFile
		const ephemeral = interaction.options.getBoolean('ephemeral') ?? false
		const explode = interaction.options.getInteger('explode') ?? 101
		const modifiers = interaction.options.getString('modifiers') ?? ''
		const diceModifiers = interaction.options.getString('dice-modifiers') ?? ''
		const rerolls = interaction.options.getInteger('rerolls') ?? 1
		if (explode < 1) {
			return await interaction.reply({ content: i18n.__('explodeNotZeroOrNegative'), ephemeral: true })
		}
		else if (explode > 101) {
			return await interaction.reply({ content: i18n.__('explodeOverPercentile'), ephemeral: true })
		}
		else if (rerolls < 1) {
			return await interaction.reply({ content: i18n.__('rerollsNegativeOrZero'), ephemeral: true })
		}
		else if (rerolls >= Math.floor(Number.parseInt(process.env.MAX_SAFE_REROLLS) / 10)) {
			return await interaction.reply({ content: i18n.__('rerollsLessThan', { value: Math.floor(Number.parseInt(process.env.MAX_SAFE_REROLLS) / 10) }), ephemeral: true })
		}
		else {
			try {
				const obj = await roll({ size: 100, number: 1, rerolls, explode, diceModifiers })
				const content = await rollsWriteContent(obj, modifiers)
				const file = await buildTempFile(JSON.stringify(content, null, 2))
				gFile = file
				const mFile = new MessageAttachment(file)
				return await interaction.reply({ content: i18n.__('totalIs', { value: content.total.toLocaleString(interaction.locale) }), ephemeral, files: [mFile] })
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
