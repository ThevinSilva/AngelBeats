import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, GuildMember } from "discord.js";
import GuildQueue from "src/interfaces/guildQueue";


export = {
	data: new SlashCommandBuilder()
		.setName('leave')
		.setDescription('I leave the vc')
	,
	async execute(interaction:CommandInteraction,member:GuildMember,guildQueue:GuildQueue){
        guildQueue.destroy()
		await interaction.reply({content: "understandable have a nice day ✌️ "})
    }
};