const { SlashCommandBuilder } = require('@discordjs/builders')
const addToStat = require('../util/addToStat')

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
			return await interaction.reply({ content: 'From cannot be negative', ephemeral: true })
		}
		else if (to < from) {
			return await interaction.reply({ content: 'To cannot be less than from value', ephemeral: true })
		}
		else {
			try {
				const hops = await addToStat(from, to)
				let content = `It takes ${hops.toLocaleString()} hops`
				content = `${content}\nTo get to level ${to.toLocaleString()}`
				content = `${content}\nFrom level ${from.toLocaleString()}`
				return await interaction.reply({ content, ephemeral })
			}
			catch (err) {
				console.error(err, interaction)
				return await interaction.reply({ content: `Error: ${err.message}`, ephemeral: true })
			}
		}
	}
}
