const { SlashCommandBuilder } = require('@discordjs/builders')
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js')
const Keyv = require('keyv')
const { join } = require('path')

const keyv = new Keyv(`sqlite://${join(__dirname, '../', 'sqlite', 'challenges.sqlite')}`)
keyv.on('error', (err) => console.error(`Keyv ${err}`))


module.exports = {
	data: new SlashCommandBuilder()
		.setName('challenge')
		.setDescription('Send a targetted user a challenge!')
		.addUserOption((option) =>
			option.setName('victim')
				.setDescription('The person you wish to challenge')
				.setRequired(true))
		.addBooleanOption((option) =>
			option.setName('expanded')
				.setDescription('Hail Sam Kass!')),
	async execute(interaction) {
		const victim = interaction.options.getUser('victim')
		const expanded = interaction.options.getBoolean('expanded') ?? false
		if (victim.bot || victim.system) {
			return await interaction.reply({ content: 'You cannot challenge bots', ephemeral: true })
		}
		else if (victim.id === interaction.user.id) {
			return await interaction.reply({ content: 'You cannot challenge yourself', ephemeral: true })
		}
		else {
			if (await keyv.get(`challenge-${interaction.user.id}-${victim.id}`) != null) {
				return interaction.reply({ content: 'An outstanding challenge already exists.\nFinish that one first!', ephemeral: true })
			}
			const time = new Date(Date.now() + 1800000)
			keyv.set(`challenge-${interaction.user.id}-${victim.id}`,
				{
					time,
					challenger: interaction.user.id,
					challengerPlayed: null,
					victim: victim.id,
					victimPlayed: null,
					expanded
				})
			const row = (expanded)
				? new MessageActionRow()
					.addComponents(
						new MessageButton().setCustomId('rock').setLabel('Rock').setStyle('PRIMARY'),
						new MessageButton().setCustomId('paper').setLabel('Paper').setStyle('SECONDARY'),
						new MessageButton().setCustomId('scissors').setLabel('Scissors').setStyle('SUCCESS'),
						new MessageButton().setCustomId('lizard').setLabel('Lizard').setStyle('DANGER'),
						new MessageButton().setCustomId('spock').setLabel('Spock').setStyle('PRIMARY')
					)
				: new MessageActionRow()
					.addComponents(
						new MessageButton().setCustomId('rock').setLabel('Rock').setStyle('PRIMARY'),
						new MessageButton().setCustomId('paper').setLabel('Paper').setStyle('SECONDARY'),
						new MessageButton().setCustomId('scissors').setLabel('Scissors').setStyle('SUCCESS')
					)
			return await interaction.reply({ content: `${victim} you have been challenged by ${interaction.user} to a duel!\nExpires at ${time.toLocaleTimeString()}`, components: [row] })
		}
	},
	async buttonExecute(interaction) {
		const challenger = interaction.message.mentions[1]
		const victim = interaction.message.mentions[0]
		const challengeStr = `challenge-${challenger.id}-${victim.id}`

		// Is player check
		if (!(interaction.user.id === challenger.id || interaction.user.id === victim.id)) {
			return await interaction.reply({ content: 'This isn\'t meant for you!', ephemeral: true })
		}
		const challenge = await keyv.get(challengeStr)

		// Is expired check
		if (Date.now() > new Date(challenge.time).getTime()) {
			keyv.delete(challengeStr)
			return await interaction.update({ content: 'Time has expired! Create a new one to try again', ephemeral: true, components: [] })
		}

		// Player role check
		interaction.user.id === challenger.id ? challenge.challengerPlayed = interaction.customId : challenge.victimPlayed = interaction.customId

		// Is terminated check
		if (challenge.challengerPlayed != null && challenge.victimPlayed != null) {
			// Do game logic
			const chalPlay = challenge.challengerPlayed
			const victPlay = challenge.victimPlayed
			keyv.delete(challengeStr)
			if (chalPlay === 'rock') {
				if (victPlay === 'rock') {
					await interaction.reply({ content: 'The game is a draw, both players chose Rock' })
					return await interaction.update({ content: 'Game has ended, Draw', components: [] })
				}
				if (victPlay === 'paper') {
					await interaction.reply({ content: 'The victim won the game, Paper Covers Rock' })
					return await interaction.update({ content: 'Game has ended, Victim Won', components: [] })
				}
				else if (victPlay === 'scissors') {
					await interaction.reply({ content: 'The challenger won the game, Rock Smashes Scissors' })
					return await interaction.update({ content: 'Game has ended, Challenger Won', components: [] })
				}
				else if (victPlay === 'lizard') {
					await interaction.reply({ content: 'The challenger won the game, Rock Crushes Lizard' })
					return await interaction.update({ content: 'Game has ended, Challenger Won', components: [] })
				}
				else if (victPlay === 'spock') {
					await interaction.reply({ content: 'The victim won the game, Spock Vaporizes Rock' })
					return await interaction.update({ content: 'Game has ended, Victim Won', components: [] })
				}
				else {
					await interaction.reply({ content: `Nobody won, error: Challenger played: ${chalPlay}, Victim played ${victPlay}`, ephemeral: true })
					return await interaction.update({ content: `Nobody won, error: Challenger played: ${chalPlay}, Victim played ${victPlay}`, ephemeral: true, components: [] })
				}
			}
			else if (chalPlay === 'paper') {
				if (victPlay === 'rock') {
					await interaction.reply({ content: 'The challenger won the game, Paper Covers Rock' })
					return await interaction.update({ content: 'Game has ended, Challenger Won', components: [] })
				}
				else if (victPlay === 'paper') {
					await interaction.reply({ content: 'The game is a draw, both players chose Paper' })
					return await interaction.update({ content: 'Game has ended, Draw', components: [] })
				}
				else if (victPlay === 'scissors') {
					await interaction.reply({ content: 'The victim won the game, Scissors Cuts Paper' })
					return await interaction.update({ content: 'Game has ended, Victim Won', components: [] })
				}
				else if (victPlay === 'lizard') {
					await interaction.reply({ content: 'The victim won the game, Lizard Eats Paper' })
					return await interaction.update({ content: 'Game has ended, Victim Won', components: [] })
				}
				else if (victPlay === 'spock') {
					await interaction.reply({ content: 'The challenger won the game, Paper Disproves Spock' })
					return await interaction.update({ content: 'Game has ended, Challenger Won', components: [] })
				}
				else {
					await interaction.reply({ content: `Nobody won, error: Challenger played: ${chalPlay}, Victim played ${victPlay}`, ephemeral: true })
					return await interaction.update({ content: `Nobody won, error: Challenger played: ${chalPlay}, Victim played ${victPlay}`, ephemeral: true, components: [] })
				}
			}
			else if (chalPlay === 'scissors') {
				if (victPlay === 'rock') {
					await interaction.reply({ content: 'The victim won the game, Rock Smashes Scissors' })
					return await interaction.update({ content: 'Game has ended, Victim Won', components: [] })
				}
				else if (victPlay === 'paper') {
					await interaction.reply({ content: 'The challenger won the game, Scissors Cuts Paper' })
					return await interaction.update({ content: 'Game has ended, Challenger Won', components: [] })
				}
				else if (victPlay === 'scissors') {
					await interaction.reply({ content: 'The game is a draw, both players chose Scissors' })
					return await interaction.update({ content: 'Game has ended, Draw', components: [] })
				}
				else if (victPlay === 'lizard') {
					await interaction.reply({ content: 'The challenger won the game, Scissors Decapitates Lizard' })
					return await interaction.update({ content: 'Game has ended, Challenger Won', components: [] })
				}
				else if (victPlay === 'spock') {
					await interaction.reply({ content: 'The victim won the game, Spock Smashes Scissors' })
					return await interaction.update({ content: 'Game has ended, Victim Won', components: [] })
				}
				else {
					await interaction.reply({ content: `Nobody won, error: Challenger played: ${chalPlay}, Victim played ${victPlay}`, ephemeral: true })
					return await interaction.update({ content: `Nobody won, error: Challenger played: ${chalPlay}, Victim played ${victPlay}`, ephemeral: true, components: [] })
				}
			}
			else if (chalPlay === 'lizard') {
				if (victPlay === 'rock') {
					await interaction.reply({ content: 'The victim won the game, Rock Crushes Lizard' })
					return await interaction.update({ content: 'Game has ended, Victim Won', components: [] })
				}
				else if (victPlay === 'paper') {
					await interaction.reply({ content: 'The challenger won the game, Lizard Eats Paper' })
					return await interaction.update({ content: 'Game has ended, Challenger Won', components: [] })
				}
				else if (victPlay === 'scissors') {
					await interaction.reply({ content: 'The victim won the game, Scissors Decapitates Lizard' })
					return await interaction.update({ content: 'Game has ended, Victim Won', components: [] })
				}
				else if (victPlay === 'lizard') {
					await interaction.reply({ content: 'The game is a draw, both players chose Lizard' })
					return await interaction.update({ content: 'Game has ended, Draw', components: [] })
				}
				else if (victPlay === 'spock') {
					await interaction.reply({ content: 'The challenger won the game, Lizard Poisons Spock' })
					return await interaction.update({ content: 'Game has ended, Challenger Won', components: [] })
				}
				else {
					await interaction.reply({ content: `Nobody won, error: Challenger played: ${chalPlay}, Victim played ${victPlay}`, ephemeral: true })
					return await interaction.update({ content: `Nobody won, error: Challenger played: ${chalPlay}, Victim played ${victPlay}`, ephemeral: true, components: [] })
				}
			}
			else if (chalPlay === 'spock') {
				if (victPlay === 'rock') {
					await interaction.reply({ content: 'The challenger won the game, Spock vaporizes rock' })
					return await interaction.update({ content: 'Game has ended, Challenger Won', components: [] })
				}
				else if (victPlay === 'paper') {
					await interaction.reply({ content: 'The victim won the game, Paper Disproves Spock' })
					return await interaction.update({ content: 'Game has ended, Victim Won', components: [] })
				}
				else if (victPlay === 'scissors') {
					await interaction.reply({ content: 'The challenger won the game, Spock Smashes Scissors' })
					return await interaction.update({ content: 'Game has ended, Challenger Won', components: [] })
				}
				else if (victPlay === 'lizard') {
					await interaction.reply({ content: 'The victim won the game, Lizard Poisons Spock' })
					return await interaction.update({ content: 'Game has ended, Victim Won', components: [] })
				}
				else if (victPlay === 'spock') {
					await interaction.reply({ content: 'The game is a draw, both players chose Spock' })
					return await interaction.update({ content: 'Game has ended, Draw', components: [] })
				}
				else {
					await interaction.reply({ content: `Nobody won, error: Challenger played: ${chalPlay}, Victim played ${victPlay}`, ephemeral: true })
					return await interaction.update({ content: `Nobody won, error: Challenger played: ${chalPlay}, Victim played ${victPlay}`, ephemeral: true, components: [] })
				}
			}
			else {
				await interaction.reply({ content: `Nobody won, error: Challenger played: ${chalPlay}, Victim played ${victPlay}`, ephemeral: true })
				return await interaction.update({ content: `Nobody won, error: Challenger played: ${chalPlay}, Victim played ${victPlay}`, ephemeral: true, components: [] })
			}
		}
		else {
			// Set role to db
			await keyv.set(challengeStr, challenge)
			return await interaction.update({ content: `${interaction.message.content}\n\n${interaction.user.toString()} has played!` })
		}
	}
}
