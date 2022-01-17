const { SlashCommandBuilder } = require('@discordjs/builders')
const { MessageActionRow, MessageButton } = require('discord.js')
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
				return await interaction.reply({ content: 'An outstanding challenge already exists.\nFinish that one first!', ephemeral: true })
			}
			const time = new Date(Date.now() + 1800000)
			keyv.set(`challenge-${interaction.user.id}-${victim.id}`,
				{
					time,
					challenger: interaction.user.id,
					challengerPlayed: null,
					victim: victim.id,
					victimPlayed: null
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
			const endRow = new MessageActionRow()
				.addComponents(
					new MessageButton().setCustomId('end').setLabel('End game').setStyle('SECONDARY')
				)
			return await interaction.reply({ content: `${victim} you have been challenged by ${interaction.user} to a duel!\nExpires at ${time.toLocaleTimeString()}`, components: [row, endRow] })
		}
	},
	async buttonExecute(interaction) {
		const challenger = interaction.message.mentions[1]
		const victim = interaction.message.mentions[0]

		if (challenger == null || victim == null) {
			// Since challenge string is built yet, and there is no capability of getting their ids, we can't remove the keyv row.
			// It will require getting some information about the interaction. So requires testing. For now, it's fine.
			return await interaction.update({ content: 'Game ended by default. User not available', ephemeral: true, components: [] })
		}

		const challengeStr = `challenge-${challenger.id}-${victim.id}`

		if (!(interaction.user.id === challenger.id || interaction.user.id === victim.id)) {
			return await interaction.reply({ content: 'This isn\'t meant for you!', ephemeral: true })
		}

		// End game check
		if (interaction.customId === 'end') {
			// Is challenger check for end game
			if (interaction.user.id === challenger.id) {
				keyv.delete(challengeStr)
				return await interaction.update({ content: 'Game ended by Challenger', components: [] })
			}
			else if (interaction.user.id === victim.id) {
				keyv.delete(challengeStr)
				return await interaction.update({ content: 'Game ended by Victim', components: [] })
			}
			else {
				return await interaction.reply({ content: 'This isn\'t meant for you!', ephemeral: true })
			}
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
			switch (chalPlay) {
			case 'rock':
				switch (victPlay) {
				case 'rock':
					await interaction.update({ content: 'The game is a draw, both players chose Rock', components: [] })
					break
				case 'paper':
					await interaction.update({ content: 'The victim won the game, Paper Covers Rock', components: [] })
					break
				case 'scissors':
					await interaction.update({ content: 'The challenger won the game, Rock Smashes Scissors', components: [] })
					break
				case 'lizard':
					await interaction.update({ content: 'The challenger won the game, Rock Crushes Lizard', components: [] })
					break
				case 'spock':
					await interaction.update({ content: 'The victim won the game, Spock vaporizes rock', components: [] })
					break
				default:
					await interaction.update({ content: `Nobody won, error: Challenger played: ${chalPlay}, Victim played ${victPlay}`, ephemeral: true, components: [] })
					break
				}
				break
			case 'paper':
				switch (victPlay) {
				case 'rock':
					await interaction.update({ content: 'The challenger won the game, Paper Covers Rock', components: [] })
					break
				case 'paper':
					await interaction.update({ content: 'The game is a draw, both players chose Paper', components: [] })
					break
				case 'scissors':
					await interaction.update({ content: 'The victim won the game, Scissors Cuts Paper', components: [] })
					break
				case 'lizard':
					await interaction.update({ content: 'The victim won the game, Lizard Eats Paper', components: [] })
					break
				case 'spock':
					await interaction.update({ content: 'The challenger won the game, Paper Disproves Spock', components: [] })
					break
				default:
					await interaction.update({ content: `Nobody won, error: Challenger played: ${chalPlay}, Victim played ${victPlay}`, ephemeral: true, components: [] })
					break
				}
				break
			case 'scissors':
				switch (victPlay) {
				case 'rock':
					await interaction.update({ content: 'The victim won the game, Rock Smashes Scissors', components: [] })
					break
				case 'paper':
					await interaction.update({ content: 'The challenger won the game, Scissors Cuts Paper', components: [] })
					break
				case 'scissors':
					await interaction.update({ content: 'The game is a draw, both players chose Scissors', components: [] })
					break
				case 'lizard':
					await interaction.update({ content: 'The challenger won the game, Scissors Decapitates Lizard', components: [] })
					break
				case 'spock':
					await interaction.update({ content: 'The victim won the game, Spock Smashes Scissors', components: [] })
					break
				default:
					await interaction.update({ content: `Nobody won, error: Challenger played: ${chalPlay}, Victim played ${victPlay}`, ephemeral: true, components: [] })
					break
				}
				break
			case 'lizard':
				switch (victPlay) {
				case 'rock':
					await interaction.update({ content: 'The victim won the game, Rock Crushes Lizard', components: [] })
					break
				case 'paper':
					await interaction.update({ content: 'The challenger won the game, Lizard Eats Paper', components: [] })
					break
				case 'scissors':
					await interaction.update({ content: 'The victim won the game, Scissors Decapitates Lizard', components: [] })
					break
				case 'lizard':
					await interaction.update({ content: 'The game is a draw, both players chose Lizard', components: [] })
					break
				case 'spock':
					await interaction.update({ content: 'The challenger won the game, Lizard Poisons Spock', components: [] })
					break
				default:
					await interaction.update({ content: `Nobody won, error: Challenger played: ${chalPlay}, Victim played ${victPlay}`, ephemeral: true, components: [] })
					break
				}
				break
			case 'spock':
				switch (victPlay) {
				case 'rock':
					await interaction.update({ content: 'The challenger won the game, Spock vaporizes rock', components: [] })
					break
				case 'paper':
					await interaction.update({ content: 'The victim won the game, Paper Disproves Spock', components: [] })
					break
				case 'scissors':
					await interaction.update({ content: 'The challenger won the game, Spock Smashes Scissors', components: [] })
					break
				case 'lizard':
					await interaction.update({ content: 'The victim won the game, Lizard Poisons Spock', components: [] })
					break
				case 'spock':
					await interaction.update({ content: 'The game is a draw, both players chose Spock', components: [] })
					break
				default:
					await interaction.update({ content: `Nobody won, error: Challenger played: ${chalPlay}, Victim played ${victPlay}`, ephemeral: true, components: [] })
					break
				}
				break
			default:
				await interaction.update({ content: `Nobody won, error: Challenger played: ${chalPlay}, Victim played ${victPlay}`, ephemeral: true, components: [] })
				break
			}
		}
		else {
			// Set role to db
			await keyv.set(challengeStr, challenge)
			if ((interaction.user.id === challenger.id && challenge.challengerPlayed != null) || (interaction.user.id === victim.id && challenge.challengerPlayed != null)) {
				return await interaction.reply({ content: 'Successfully updated', ephemeral: true })
			}
			return await interaction.update({ content: `${interaction.message.content}\n\n${interaction.user.toString()} has played!` })
		}
	}
}
