import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, GuildMember } from "discord.js";
import GuildQueue from "src/interfaces/guildQueue";


export = {
	data: new SlashCommandBuilder()
		.setName('skip')
		.setDescription('skips current track')
	,
	async execute(interaction:CommandInteraction,member:GuildMember,guildQueue:GuildQueue){
		if(!guildQueue.isEmpty()) {
			guildQueue.playNext(true)
        	await interaction.reply({ content: " ⏭️ **skip** "})
		}else{
			await interaction.reply({ content: " 🛑 **cannot skip queue empty** "})
		}
	}
};