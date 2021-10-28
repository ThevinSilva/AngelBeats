import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, GuildMember } from "discord.js";
import GuildQueue from "src/interfaces/guildQueue";
import Track from "src/interfaces/track";


export = {
	data: new SlashCommandBuilder()
		.setName('remove')
		.setDescription('removes the last entry to the queue')
	,
	async execute(interaction:CommandInteraction,member:GuildMember,guildQueue:GuildQueue){
        if(!guildQueue.isEmpty()){
            const { title } = guildQueue.pop();
		    await interaction.reply({content: ` removed ${title} from queue`})
            return 
        }
        await interaction.reply({content: ` queue is empty `})
    }
};