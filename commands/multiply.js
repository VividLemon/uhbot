const { SlashCommandBuilder } = require('@discordjs/builders')
const { join } = require('path')
const { unlink } = require('fs')
const addModifiers = require('../util/addModifiers')
const buildTempFile = require('../util/buildTempFile')
const { MessageAttachment } = require('discord.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('multiply')
		.setDescription('Multiplies multiple inputs')
		.addStringOption((option) =>
			option.setName('values')
				.setDescription('Each value you wish to multiply separated by a space, ex: 10 20 30 40')
				.setRequired(true))
		.addStringOption((option) =>
			option.setName('modifiers')
				.setDescription('Modifies each value with a given modified (+, -, *, /). Executes in the order provided, ex (+5-2*3)'))
		.addBooleanOption((option) =>
			option.setName('ephemeral')
				.setDescription('Hides the value for only you to see')),
	async execute(interaction) {
		let gFile
		const ephemeral = interaction.options.getBoolean('ephemeral') ?? false
		const modifiers = interaction.options.getString('modifiers') ?? ''
		const values = interaction.options.getString('values')
		const nums = values.split(/\s+/).filter((element) => !isNaN(element))
		if (values === '') {
			return await interaction.reply({ content: 'Value cannot be empty', ephemeral: true })
		}
		else if (!nums.length) {
			return await interaction.reply({ content: 'Values contains no numbers', ephemeral: true })
		}
		else {
			try {
				const obj = {
					total: Number.parseInt(nums[0]),
					value: Number.parseInt(nums[0]),
					modifieds: 0
				}
				nums.forEach((element, index) => {
					if (index !== 0) {
						element = Number.parseInt(element)
						obj.value = obj.value * element
						obj.total = obj.value
					}
				})
				if (modifiers) {
					const mods = addModifiers(modifiers, obj.total)
					obj.modifieds = mods
					obj.total = obj.modifieds
				}
				else {
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
