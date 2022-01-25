const { SlashCommandBuilder } = require('@discordjs/builders')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('github')
		.setDescription('Sends the github repository'),
	async execute(interaction) {
		const { i18n } = require('../plugins/')
		try {
			return await interaction.reply({ content: 'https://github.com/kwiksilver3441/uhbot', ephemeral: true })
		}
		catch (err) {
			console.error({ error: err, interaction })
			return await interaction.reply({ content: `${i18n.__('error')}: ${err.message}`, ephemeral: true })
		}
	}
}
