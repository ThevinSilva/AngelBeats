import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, GuildMember, MessageEmbed, TextBasedChannels, VoiceChannel } from "discord.js";
import GuildQueue from "src/interfaces/guildQueue";


export = {
	data: new SlashCommandBuilder()
		.setName('queue')
		.setDescription('Display items in the queue')
	,
	async execute(interaction:CommandInteraction,member:GuildMember,guildQueue:GuildQueue){
        
		if(!guildQueue.isEmpty()){
            await interaction.reply({content: " **QUEUE** "})
            
            const queueEmbed = new MessageEmbed()
            .setColor('#000000')		
            
            //adds song to the queue
            let count = 0
            for(let item of guildQueue.display()){
                count++
                queueEmbed.addFields(
                    { name: count.toString(), value:item.title}
                )
            }
            await (interaction.channel as TextBasedChannels).send({embeds: [queueEmbed]});
		}else{
            await interaction.reply({content: "queue is empty"})
        }
    }
};