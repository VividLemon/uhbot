const { SlashCommandBuilder } = require('@discordjs/builders')
const buildTempFile = require('../util/buildTempFile')
const roll = require('../util/roll')
const rollsWriteContent = require('../util/rollsWriteContent')
const { unlink } = require('fs/promises')
const { MessageAttachment } = require('discord.js')


module.exports = {
	data: new SlashCommandBuilder()
		.setName('roll-one')
		.setDescription('Rolls one die')
		.addIntegerOption((option) =>
			option.setName('size')
				.setDescription('Size of the die')
				.setRequired(true))
		.addStringOption((option) =>
			option.setName('modifiers')
				.setDescription('Modifies the final with a given modified (+,-,*,/). Executes in the order provided, ex (+5-2*3)'))
		.addStringOption((option) =>
			option.setName('dice-modifiers')
				.setDescription('Modifies each dice roll with a given modifier. Explodes excluded'))
		.addIntegerOption((option) =>
			option.setName('explode')
				.setDescription('Causes a reroll when the roll value hits or exceeds target'))
		.addIntegerOption((option) =>
			option.setName('rerolls')
				.setDescription('Rerolls the die x amount of times'))
		.addBooleanOption((option) =>
			option.setName('ephemeral')
				.setDescription('Hides the value for only you to see')),
	async execute(interaction) {
		let gFile
		const size = interaction.options.getInteger('size')
		const rerolls = interaction.options.getInteger('rerolls') ?? 1
		const ephemeral = interaction.options.getBoolean('ephemeral') ?? false
		const explode = interaction.options.getInteger('explode') ?? size + 1
		const modifiers = interaction.options.getString('modifiers') ?? ''
		const diceModifiers = interaction.options.getString('dice-modifiers') ?? ''
		if (size < 1) {
			return await interaction.reply({ content: 'Size cannot be negative or zero', ephemeral: true })
		}
		else if (explode > size + 1) {
			return await interaction.reply({ content: 'Explode cannot be greater than the size of the die', ephemeral: true })
		}
		else if (rerolls < 1) {
			return await interaction.reply({ content: 'Reroll cannot be negative or zero', ephemeral: true })
		}
		else if (rerolls >= Math.floor(Number.parseInt(process.env.MAX_SAFE_REROLLS) / 10)) {
			return await interaction.reply({ content: `Rerolls should be less than ${Math.floor(Number.parseInt(process.env.MAX_SAFE_REROLLS) / 10)}`, ephemeral: true })
		}
		else {
			try {
				const obj = await roll({ size, number: 1, rerolls, explode, diceModifiers })
				const content = await rollsWriteContent(obj, modifiers)
				const file = await buildTempFile(JSON.stringify(content, null, 2))
				gFile = file
				const mFile = new MessageAttachment(file)
				return await interaction.reply({ content: `The total is ${content.total.toLocaleString()}`, ephemeral, files: [mFile] })
			}
			catch (err) {
				console.error(err, interaction)
				return await interaction.reply({ content: `Error: ${err.message}`, ephemeral: true })
			}
			finally {
				if (gFile != null) {
					unlink(gFile)
						.catch((err) => {
							console.error(err, interaction)
						})
				}
			}
		}
	}
}
