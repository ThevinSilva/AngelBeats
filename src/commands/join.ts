import { SlashCommandBuilder } from "@discordjs/builders";
import { DiscordGatewayAdapterCreator } from "@discordjs/voice";
import { CommandInteraction, GuildMember, VoiceChannel } from "discord.js";
import GuildQueue from "src/interfaces/guildQueue";


export = {
	data: new SlashCommandBuilder()
		.setName('join')
		.setDescription('join your current vc')
	,
	async execute(interaction:CommandInteraction,member:GuildMember,guildQueue:GuildQueue){
        const voiceChannel = (interaction.member as GuildMember).voice.channel as VoiceChannel;

		if(guildQueue.channelId !== voiceChannel.id){

            guildQueue.connectionChanger(
                voiceChannel?.id,
                voiceChannel.guild.voiceAdapterCreator as DiscordGatewayAdapterCreator
            );
            
            await interaction.reply({ content: ` **joining** ${voiceChannel?.name}`})
            return

        }else{
            await interaction.reply({ content: ` already in ${voiceChannel?.name}`})
            return
        }
        

    }
};