const { SlashCommandBuilder } = require('@discordjs/builders')
const addToHop = require('../util/addToHop')
const { i18n } = require('../bot')

module.exports = {
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
	async execute(interaction) {
		const skill = interaction.options.getInteger('skill')
		const hops = interaction.options.getInteger('hops')
		const ephemeral = interaction.options.getBoolean('ephemeral') ?? false
		if (skill < 0) {
			return await interaction.reply({ content: i18n.__('skillNotNegative'), ephemeral: true })
		}
		else if (hops <= 0) {
			return await interaction.reply({ content: i18n.__('hopsNotNegative'), ephemeral: true })
		}
		else {
			try {
				const obj = await addToHop(skill, hops)
				let content = `${i18n.__('canGetToSkill')}: ${obj.newSkill.toLocaleString(interaction.locale)}`
				content = `${content}\n${i18n.__('startingAtLevel')}: ${obj.oldSkill.toLocaleString(interaction.locale)}`
				content = `${content}\n${i18n.__('with')} ${obj.hopsRemaining.toLocaleString(interaction.locale)} ${(Math.abs(obj.hopsRemaining) === 1) ? i18n.__n('hop', 1) : i18n.__('hop', 2)} ${i18n.__('remaining')}`
				return await interaction.reply({ content, ephemeral })
			}
			catch (err) {
				console.error({ error: err, interaction })
				return await interaction.reply({ content: `${i18n.__('error')}: ${err.message}`, ephemeral: true })
			}
		}
	}
}
