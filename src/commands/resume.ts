import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, GuildMember } from "discord.js";
import GuildQueue from "src/interfaces/guildQueue";


export = {
	data: new SlashCommandBuilder()
		.setName('resume')
		.setDescription('resume music')
	,
	async execute(interaction:CommandInteraction,member:GuildMember,guildQueue:GuildQueue){
		guildQueue.resume()
        await interaction.reply({ content: " ▶️ **resume** "})
    }
};