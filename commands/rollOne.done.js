const { SlashCommandBuilder } = require('@discordjs/builders')
const buildTempFile = require('../util/buildTempFile')
const roll = require('../util/roll')
const rollsWriteContent = require('../util/rollsWriteContent')
const { readdir, unlink } = require('fs/promises')
const { join } = require('path')
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
				.setDescription('Modifies each roll with a given modified (+, -, *, /). Executes in the order provided, ex (+5-2*3)'))
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
		const size = interaction.options.getInteger('size')
		const rerolls = interaction.options.getInteger('rerolls') ?? 1
		const ephemeral = interaction.options.getBoolean('ephemeral') ?? false
		const explode = interaction.options.getInteger('explode') ?? size + 1
		const modifiers = interaction.options.getString('modifiers') ?? ''
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
				const obj = await roll({ size, number: 1, rerolls, explode, modifiers })
				const content = await rollsWriteContent(obj)
				const file = await buildTempFile(JSON.stringify(content, null, 2))
				const mFile = new MessageAttachment(file)
				return await interaction.reply({ content: `The total is ${content.total}`, ephemeral, files: [mFile] })
			}
			catch (err) {
				console.error(err)
				return await interaction.reply({ content: 'There was an error while trying to execute this command', ephemeral: true })
			}
			finally {
				const path = join(__dirname, '../', '/tmp')
				readdir(path).then((resp) => resp.forEach((file) => unlink(join(path, file))))
			}
		}
	}
}
