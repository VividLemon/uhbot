const { SlashCommandBuilder } = require('@discordjs/builders')
const { i18n } = require('../bot')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with pong'),
	async execute(interaction) {
		return await interaction.reply(i18n.__('pong'))
	}

}
