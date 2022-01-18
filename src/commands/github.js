const { SlashCommandBuilder } = require('@discordjs/builders')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('github')
		.setDescription('Sends the github repository'),
	async execute(interaction) {
		try {
			return await interaction.reply({ content: 'https://github.com/kwiksilver3441/uhbot', ephemeral: true })
		}
		catch (err) {
			console.error({ error: err, interaction })
			return await interaction.reply({ content: `Error: ${err.message}`, ephemeral: true })
		}
	}
}
