import { ButtonInteraction, CacheType, CommandInteraction } from 'discord.js'
import { SystemError } from '.'
import { i18n } from '../plugins'

export default async (error: any, interaction: CommandInteraction<CacheType> | ButtonInteraction<CacheType>): Promise<void> => {
  console.error({ error, interaction })
  if (error instanceof SystemError) {
    return await interaction.reply({ content: error.message, ephemeral: true })
  }
  return await interaction.reply({ content: `${i18n.__('unexpectedIssue')}. ${i18n.__('errorWasLogged')}`, ephemeral: true })
}
