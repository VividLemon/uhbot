const { SlashCommandBuilder } = require('@discordjs/builders')
const addToStat = require('../util/addToStat')
const { i18n } = require('../bot')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('add-to-stat')
		.setDescription('Returns how many hops you need to add a stat to a specified amount')
		.addIntegerOption((option) =>
			option.setName('from')
				.setDescription('The starting stat')
				.setRequired(true))
		.addIntegerOption((option) =>
			option.setName('to')
				.setDescription('The desired to amount')
				.setRequired(true))
		.addIntegerOption((option) =>
			option.setName('ephemeral')
				.setDescription('Hides the value for only you to see')),
	async execute(interaction) {
		const from = interaction.options.getInteger('from')
		const to = interaction.options.getInteger('to')
		const ephemeral = interaction.options.getBoolean('ephemeral') ?? false
		if (from < 0) {
			return await interaction.reply({ content: i18n.__('fromNotNegative'), ephemeral: true })
		}
		else if (to < from) {
			return await interaction.reply({ content: i18n.__('toNotValue'), ephemeral: true })
		}
		else {
			try {
				const hops = await addToStat(from, to)
				let content = `${i18n.__('itTakes')} ${hops.toLocaleString(interaction.locale)} ${i18n.__n('hop', 2)}`
				content = `${content}\n${i18n.__('toGetToLevel')} ${to.toLocaleString(interaction.locale)}`
				content = `${content}\n${i18n.__('fromLevel')} ${from.toLocaleString(interaction.locale)}`
				return await interaction.reply({ content, ephemeral })
			}
			catch (err) {
				console.error({ error: err, interaction })
				return await interaction.reply({ content: `${i18n.__('error')}: ${err.message}`, ephemeral: true })
			}
		}
	}
}
