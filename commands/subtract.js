const { SlashCommandBuilder } = require('@discordjs/builders')
const addModifiers = require('../util/addModifiers')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('subtract')
		.setDescription('Subtracts multiple inputs')
		.addStringOption((option) =>
			option.setName('values')
				.setDescription('Each value you wish to subtract separated by a space, ex: 10 20 30 40')
				.setRequired(true))
		.addStringOption((option) =>
			option.setName('modifiers')
				.setDescription('Modifies each value with a given modified (+, -, *, /). Executes in the order provided, ex (+5-2*3)'))
		.addBooleanOption((option) =>
			option.setName('ephemeral')
				.setDescription('Hides the value for only you to see')),
	async execute(interaction) {
		const ephemeral = interaction.options.getBoolean('ephemeral') ?? false
		const modifiers = interaction.options.getString('modifiers') ?? ''
		const values = interaction.options.getString('values')
		let total
		values.split(/\s+/).forEach((element) => {
			const value = Number.parseFloat(element)
			if (!isNaN(value)) {
				if (total == null) {
					total = value
				}
				if (modifiers) {
					const regex = /[+|\-|*|x|/]\d+/g
					modifiers.match(regex).forEach((mod) => {
						const modified = addModifiers(mod, value)
						if (modified !== false) {
							total = total - modified
						}
					})
				}
				else {
					total = total - value
				}
			}
		})
		let content = `This equals ${total}`
		const modReplace = modifiers.replace(/\s+/g, '')
		content = (modifiers)
			? `${content}\nWith each value being modified by ${modReplace}`
			: content
		await interaction.reply({ content, ephemeral })
	}
}
