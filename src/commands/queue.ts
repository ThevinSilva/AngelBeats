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

                
                //adds song to the queue

                /*Discord Embed Limitations 
                    +-------------+------------------------+
                    |    Field    |         Limit          |
                    +-------------+------------------------+
                    | title       | 256 characters         |
                    | description | 4096 characters*       |
                    | fields      | Up to 25 field objects |
                    | field.name  | 256 characters         |
                    | field.value | 1024 characters        |
                    | footer.text | 2048 characters        |
                    | author.name | 256 characters         |
                    +-------------+------------------------+
                */
                let embeds:Array<MessageEmbed> = [];
                let queue = guildQueue.display()
                
                if(queue.length < 5){ 
                    let fields = Array.from(queue.slice(0,queue.length),(x,v ) => ({name: v.toString(), value:"#" + x.title || "ANGELBEATS: I c u are very cultured this song has no name " }) )
                    await (interaction.channel as TextBasedChannels).send({embeds: [
                        new MessageEmbed()
                            .addFields(fields)
                    ]});
                    return 
                }

                // 256 + x + x(1024) < 6000 =>  Safe maximum of 5 embeds per message
                for(let i = 0;i < (Math.floor(queue.length / 5) * 5) ;i+=5){
                    
                    let embedFields = Array.from(queue.slice(i,i + 5),(x,v) => ({name: (i + v).toString(), value: "#" + x.title || "ANGELBEATS: I c u are very cultured this song has no name " }))
                    embeds.push(new MessageEmbed().addFields(embedFields))
                   
                    if(i >= 45) break;
                }
                
                await (interaction.channel as TextBasedChannels).send({embeds});
                return
            }else{
                
                await interaction.reply({content: "queue is empty"})
                return
            }

    }
};