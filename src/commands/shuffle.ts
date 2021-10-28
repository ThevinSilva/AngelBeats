import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, GuildMember } from "discord.js";
import GuildQueue from "src/interfaces/guildQueue";


export = {
	data: new SlashCommandBuilder()
		.setName('shuffle')
		.setDescription('shuffles the queue')
	,
	async execute(interaction:CommandInteraction,member:GuildMember,guildQueue:GuildQueue){
		await guildQueue.shuffle()
        await interaction.reply({ content: " 🔀 **shuffle** "})
    }
};