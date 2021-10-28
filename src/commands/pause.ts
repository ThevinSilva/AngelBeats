import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, GuildMember } from "discord.js";
import GuildQueue from "src/interfaces/guildQueue";


export = {
	data: new SlashCommandBuilder()
		.setName('pause')
		.setDescription('pause music')
	,
	async execute(interaction:CommandInteraction,member:GuildMember,guildQueue:GuildQueue){
		guildQueue.pause()
        await interaction.reply({ content: " ⏸️ **paused** "})
    }
};