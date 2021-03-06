import { SlashCommandBuilder } from '@discordjs/builders'
import { APIMessage } from 'discord-api-types'
import { ButtonInteraction, CommandInteraction, MessageActionRow, MessageButton } from 'discord.js'
import { i18n, keyv } from '../plugins/'

export default {
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
  async execute (interaction: CommandInteraction): Promise<void> {
    const victim = interaction.options.getUser('victim')!
    const expanded = interaction.options.getBoolean('expanded') ?? false
    if (victim.bot || victim.system) {
      return await interaction.reply({ content: i18n.__('cannotChallengeBots'), ephemeral: true })
    } else if (victim.id === interaction.user.id) {
      return await interaction.reply({ content: i18n.__('cannotChallengeYourself'), ephemeral: true })
    }
    const chall = await keyv.get(`challenge-${interaction.user.id}-${victim.id}`)
    if (chall != null) {
      return await interaction.reply({ content: i18n.__('challengeOutstanding'), ephemeral: true })
    }
    await keyv.set(`challenge-${interaction.user.id}-${victim.id}`,
      {
        challenger: interaction.user.id,
        challengerPlayed: null,
        victim: victim.id,
        victimPlayed: null
      }, Number.parseInt(process.env.CHALLENGE_EXPIRES_MS!))
    const row = (expanded)
      ? new MessageActionRow()
        .addComponents(
          new MessageButton().setCustomId('rock').setLabel(i18n.__('rock')).setStyle('PRIMARY'),
          new MessageButton().setCustomId('paper').setLabel(i18n.__('paper')).setStyle('SECONDARY'),
          new MessageButton().setCustomId('scissors').setLabel(i18n.__('scissors')).setStyle('SUCCESS'),
          new MessageButton().setCustomId('lizard').setLabel(i18n.__('lizard')).setStyle('DANGER'),
          new MessageButton().setCustomId('spock').setLabel('Spock').setStyle('PRIMARY')
        )
      : new MessageActionRow()
        .addComponents(
          new MessageButton().setCustomId('rock').setLabel(i18n.__('rock')).setStyle('PRIMARY'),
          new MessageButton().setCustomId('paper').setLabel(i18n.__('paper')).setStyle('SECONDARY'),
          new MessageButton().setCustomId('scissors').setLabel(i18n.__('scissors')).setStyle('SUCCESS')
        )
    const endRow = new MessageActionRow()
      .addComponents(
        new MessageButton().setCustomId('end').setLabel(i18n.__('endGame')).setStyle('SECONDARY')
      )
    const ttl = new Date(Date.now() + Number.parseInt(process.env.CHALLENGE_EXPIRES_MS!))
    await interaction.reply({ content: `${victim} ${i18n.__('challengedBy')} ${interaction.user} ${i18n.__('toADuel')}!\n${i18n.__('expiresAt')} ${ttl.toLocaleString(i18n.getLocale())}`, components: [row, endRow] })
  },
  async buttonExecute (interaction: ButtonInteraction): Promise<void> {
    const challenger = (interaction.message as any as APIMessage).mentions[0]
    const victim = (interaction.message as any as APIMessage).mentions[1]
    if (challenger == null || victim == null) {
      return await interaction.update({ content: i18n.__('endedByDefault'), components: [] })
    }

    const challengeStr = `challenge-${challenger.id}-${victim.id}`

    if (!(interaction.user.id === challenger.id || interaction.user.id === victim.id)) {
      return await interaction.reply({ content: i18n.__('notMeantForPlayer'), ephemeral: true })
    }

    // End game check
    if (interaction.customId === 'end') {
      // Is challenger check for end game
      if (interaction.user.id === challenger.id) {
        await keyv.delete(challengeStr)
        return await interaction.update({ content: i18n.__('gameEndedBy', { user: 'Challenger' }), components: [] })
      } else if (interaction.user.id === victim.id) {
        await keyv.delete(challengeStr)
        return await interaction.update({ content: i18n.__('gameEndedBy', { user: 'Victim' }), components: [] })
      }
      return await interaction.reply({ content: i18n.__('notMeantForPlayer'), ephemeral: true })
    }
    const challenge = await keyv.get(challengeStr)
    const copy = { ...challenge }
    // Is expired check
    if (challenge == null) {
      return await interaction.update({ content: i18n.__('timeExpired'), components: [] })
    }

    // Player role check
    interaction.user.id === challenger.id ? copy.challengerPlayed = interaction.customId : copy.victimPlayed = interaction.customId

    // Is terminated check
    if (copy.challengerPlayed != null && copy.victimPlayed != null) {
      // Do game logic
      const chalPlay = copy.challengerPlayed
      const victPlay = copy.victimPlayed
      await keyv.delete(challengeStr)
      switch (chalPlay) {
        case 'rock':
          switch (victPlay) {
            case 'rock':
              await interaction.update({ content: i18n.__('draw', { reason: i18n.__('rock') }), components: [] })
              break
            case 'paper':
              await interaction.update({ content: i18n.__('victimWon', { reason: i18n.__('rockPaper') }), components: [] })
              break
            case 'scissors':
              await interaction.update({ content: i18n.__('challengerWon', { reason: i18n.__('rockScissors') }), components: [] })
              break
            case 'lizard':
              await interaction.update({ content: i18n.__('challengerWon', { reason: i18n.__('rockLizard') }), components: [] })
              break
            case 'spock':
              await interaction.update({ content: i18n.__('victimWon', { reason: i18n.__('rockSpock') }), components: [] })
              break
            default:
              await interaction.update({ content: i18n.__('nobodyWonError', { chalPlay, victPlay }), components: [] })
              break
          }
          break
        case 'paper':
          switch (victPlay) {
            case 'rock':
              await interaction.update({ content: i18n.__('challengerWon', { reason: i18n.__('rockPaper') }), components: [] })
              break
            case 'paper':
              await interaction.update({ content: i18n.__('draw', { reason: i18n.__('paper') }), components: [] })
              break
            case 'scissors':
              await interaction.update({ content: i18n.__('victimWon', { reason: i18n.__('paperScissors') }), components: [] })
              break
            case 'lizard':
              await interaction.update({ content: i18n.__('victimWon', { reason: i18n.__('paperLizard') }), components: [] })
              break
            case 'spock':
              await interaction.update({ content: i18n.__('challengerWon', { reason: i18n.__('paperSpock') }), components: [] })
              break
            default:
              await interaction.update({ content: i18n.__('nobodyWonError', { chalPlay, victPlay }), components: [] })
              break
          }
          break
        case 'scissors':
          switch (victPlay) {
            case 'rock':
              await interaction.update({ content: i18n.__('victimWon', { reason: i18n.__('rockScissors') }), components: [] })
              break
            case 'paper':
              await interaction.update({ content: i18n.__('challengerWon', { reason: i18n.__('paperScissors') }), components: [] })
              break
            case 'scissors':
              await interaction.update({ content: i18n.__('draw', { reason: i18n.__('scissors') }), components: [] })
              break
            case 'lizard':
              await interaction.update({ content: i18n.__('challengerWon', { reason: i18n.__('scissorsLizard') }), components: [] })
              break
            case 'spock':
              await interaction.update({ content: i18n.__('victimWon', { reason: i18n.__('scissorsSpock') }), components: [] })
              break
            default:
              await interaction.update({ content: i18n.__('nobodyWonError', { chalPlay, victPlay }), components: [] })
              break
          }
          break
        case 'lizard':
          switch (victPlay) {
            case 'rock':
              await interaction.update({ content: i18n.__('victimWon', { reason: i18n.__('rockLizard') }), components: [] })
              break
            case 'paper':
              await interaction.update({ content: i18n.__('challengerWon', { reason: i18n.__('paperLizard') }), components: [] })
              break
            case 'scissors':
              await interaction.update({ content: i18n.__('victimWon', { reason: i18n.__('scissorsLizard') }), components: [] })
              break
            case 'lizard':
              await interaction.update({ content: i18n.__('draw', { reason: i18n.__('lizard') }), components: [] })
              break
            case 'spock':
              await interaction.update({ content: i18n.__('challengerWon', { reason: i18n.__('lizardSpock') }), components: [] })
              break
            default:
              await interaction.update({ content: i18n.__('nobodyWonError', { chalPlay, victPlay }), components: [] })
              break
          }
          break
        case 'spock':
          switch (victPlay) {
            case 'rock':
              await interaction.update({ content: i18n.__('challengerWon', { reason: i18n.__('rockSpock') }), components: [] })
              break
            case 'paper':
              await interaction.update({ content: i18n.__('victimWon', { reason: i18n.__('paperSpock') }), components: [] })
              break
            case 'scissors':
              await interaction.update({ content: i18n.__('challengerWon', { reason: i18n.__('scissorsSpock') }), components: [] })
              break
            case 'lizard':
              await interaction.update({ content: i18n.__('victimWon', { reason: i18n.__('lizardSpock') }), components: [] })
              break
            case 'spock':
              await interaction.update({ content: i18n.__('draw', { reason: 'Spock' }), components: [] })
              break
            default:
              await interaction.update({ content: i18n.__('nobodyWonError', { chalPlay, victPlay }), components: [] })
              break
          }
          break
        default:
          await interaction.update({ content: i18n.__('nobodyWonError', { chalPlay, victPlay }), components: [] })
          break
      }
      return
    }
    // Set role to db
    await keyv.set(challengeStr, copy, Number.parseInt(process.env.CHALLENGE_EXPIRES_MS!))
    if ((interaction.user.id === challenger.id && challenge.challengerPlayed == null) || (interaction.user.id === victim.id && challenge.victimPlayed == null)) {
      return await interaction.update({ content: `${interaction.message.content}\n${interaction.user.toString()} ${i18n.__('hasPlayed')}!` })
    }
    await interaction.reply({ content: i18n.__('successfullyUpdated'), ephemeral: true })
  }
}
