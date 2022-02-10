import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction } from 'discord.js'
import { i18n } from '../plugins/'

export default {
	data: new SlashCommandBuilder()
		.setName('github')
		.setDescription('Sends the github repository'),
	async execute(interaction: CommandInteraction) {
		try {
			return await interaction.reply({ content: 'https://github.com/kwiksilver3441/uhbot', ephemeral: true })
		}
		catch (err: any) {
			console.error({ error: err, interaction })
			return await interaction.reply({ content: `${i18n.__('error')}: ${err.message}`, ephemeral: true })
		}
	}
}
