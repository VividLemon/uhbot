const { SlashCommandBuilder } = require('@discordjs/builders')
const addToHop = require('../util/addToHop')

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
			return await interaction.reply({ content: 'Skill cannot be negative', ephemeral: true })
		}
		else if (hops <= 0) {
			return await interaction.reply({ content: 'Hops cannot be negative or 0', ephemeral: true })
		}
		else {
			try {
				const obj = await addToHop(skill, hops)
				let content = `You can get to skill level: ${obj.newSkill}`
				content = `${content}\nStarting at level: ${obj.oldSkill}`
				content = `${content}\nWith ${obj.hopsRemaining} ${(Math.abs(obj.hopsRemaining) === 1) ? 'hop' : 'hops'} remaining`
				return await interaction.reply({ content, ephemeral })
			}
			catch (err) {
				console.error(err)
				return await interaction.reply({ content: 'Issue while trying to execute command', ephemeral: true })
			}
		}
	}
}
