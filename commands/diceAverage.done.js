const { SlashCommandBuilder } = require('@discordjs/builders')
const addModifiers = require('../util/addModifiers')
const buildTempFile = require('../util/buildTempFile')
const { unlink } = require('fs')
const { join } = require('path')
const { MessageAttachment } = require('discord.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('dice-average')
		.setDescription('Gets the expected average of dice')
		.addIntegerOption((option) =>
			option.setName('size')
				.setDescription('Size of each die')
				.setRequired(true))
		.addIntegerOption((option) =>
			option.setName('number')
				.setDescription('How many of each die')
				.setRequired(true))
		.addStringOption((option) =>
			option.setName('modifiers')
				.setDescription('Modifies each value with a given modified (+, -, *, /). Executes in the order provided, ex (+5-2*3)'))
		.addIntegerOption((option) =>
			option.setName('rerolls')
				.setDescription('Rerolls the same size and number of dice x amount of times'))
		.addBooleanOption((option) =>
			option.setName('ephemeral')
				.setDescription('Hides the value for only you to see')),
	async execute(interaction) {
		let gFile
		const number = interaction.options.getInteger('number')
		const size = interaction.options.getInteger('size')
		const ephemeral = interaction.options.getBoolean('ephemeral') ?? false
		const modifiers = interaction.options.getString('modifiers') ?? ''
		const rerolls = interaction.options.getInteger('rerolls') ?? 1
		if (size < 1) {
			return await interaction.reply({ content: 'Size cannot be negative or zero', ephemeral: true })
		}
		else if (number < 1) {
			return await interaction.reply({ content: 'Number cannot be negative or zero', ephemeral: true })
		}
		else if (rerolls < 1) {
			return await interaction.reply({ content: 'Rerolls cannot be negative or zero', ephemeral: true })
		}
		else if (rerolls >= Math.floor(Number.parseInt(process.env.MAX_SAFE_REROLLS))) {
			return await interaction.reply({ content: `Rerolls should be less than ${Math.floor(Number.parseInt(process.env.MAX_SAFE_REROLLS))}`, ephemeral: true })
		}
		else {
			try {
				const avg = Math.round(((size + 1) / 2) * (number))
				const obj = {
					total: 0,
					averages: (avg * rerolls),
					modifieds: 0
				}
				if (modifiers) {
					const mods = addModifiers(modifiers, avg)
					obj.modifieds = mods * rerolls
					obj.total = obj.modifieds
				}
				else {
					obj.total = obj.averages
					delete obj.modifieds
				}
				const file = await buildTempFile(JSON.stringify(obj, null, 2))
				gFile = file
				const mFile = new MessageAttachment(file)
				return await interaction.reply({ content: `The total is ${obj.total.toLocaleString()}`, ephemeral, files: [mFile] })
			}
			catch (err) {
				console.error(err)
				return await interaction.reply({ content: `Error: ${err.message}`, ephemeral: true })
			}
			finally {
				if (gFile != null) {
					const path = join(__dirname, '../', '/tmp')
					unlink(join(path, gFile))
				}
			}
		}
	}
}
