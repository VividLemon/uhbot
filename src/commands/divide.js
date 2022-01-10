const { SlashCommandBuilder } = require('@discordjs/builders')
const { unlink } = require('fs/promises')
const addModifiers = require('../util/addModifiers')
const buildTempFile = require('../util/buildTempFile')
const { MessageAttachment } = require('discord.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('divide')
		.setDescription('Divides multiple inputs')
		.addStringOption((option) =>
			option.setName('values')
				.setDescription('Each value you wish to divide separated by a space, ex: 10 20 30 40')
				.setRequired(true))
		.addStringOption((option) =>
			option.setName('modifiers')
				.setDescription('Modifies the final with a given modified (+,-,*,/). Executes in the order provided, ex (+5-2*3)'))
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
		else if (nums.findIndex((el) => Number.parseInt(el) === 0) !== -1) {
			return await interaction.reply({ content: 'No values can be 0. Cannot divide by 0', ephemeral: true })
		}
		else if (nums.length > Number.parseInt(process.env.MAX_SAFE_ARGS)) {
			console.warn(interaction)
			return await interaction.reply({ content: 'Value is over the maximum safe arguments limit. Why are you using this many arguments?', ephemeral: true })
		}
		else {
			try {
				const obj = {
					total: Number.parseInt(nums[0]),
					value: Number.parseInt(nums[0]),
					modifiers: modifiers || null
				}
				nums.forEach((element, index) => {
					if (index !== 0) {
						element = Number.parseInt(element)
						obj.value = obj.value / element
						obj.total = obj.value
					}
				})
				if (modifiers) {
					obj.total = addModifiers(modifiers, obj.total)
				}
				else {
					delete obj.modifiers
				}
				obj.total = Number.parseFloat(obj.total.toFixed(3))
				obj.value = Number.parseFloat(obj.value.toFixed(3))
				const file = await buildTempFile(JSON.stringify(obj, null, 2))
				gFile = file
				const mFile = new MessageAttachment(file)
				return await interaction.reply({ content: `The total is ${obj.total.toLocaleString()}`, ephemeral, files: [mFile] })
			}
			catch (err) {
				console.error({ error: err, interaction })
				return await interaction.reply({ content: `Error: ${err.message}`, ephemeral: true })
			}
			finally {
				if (gFile != null) {
					unlink(gFile)
						.catch((err) => {
							console.error({ error: err, interaction })
						})
				}
			}
		}
	}
}
