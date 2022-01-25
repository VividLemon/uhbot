const { SlashCommandBuilder } = require('@discordjs/builders')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with pong'),
	async execute(interaction) {
		const { i18n } = require('../plugins/')
		return await interaction.reply(i18n.__('pong'))
	}

}
