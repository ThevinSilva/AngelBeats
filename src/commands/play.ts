import { SlashCommandBuilder } from '@discordjs/builders';
import { Channel, ChannelManager, Client, CommandInteraction, Guild, GuildMember, MessageEmbed, TextBasedChannels  } from 'discord.js';
import { joinVoiceChannel, createAudioPlayer, createAudioResource, demuxProbe, DiscordGatewayAdapterCreator } from '@discordjs/voice';
import yts from "yt-search";
import ytdl from 'ytdl-core';

//global hash table of servers/guilds each server property contains a queue of songs


//fix the any issue
const probeAndCreateAudioResource = async (ytStream: any) => {
	const { stream , type } = await demuxProbe(ytStream);
	return createAudioResource(ytStream, { inputType : type})
}

export = {
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('Give me either a youtube link and I will play it')
		.addStringOption(option => 
			option.setName('input')
				.setDescription("the input to echo back to the user")
				.setRequired(true)
			)
		,
	async execute(interaction:CommandInteraction,member:GuildMember,guild:Guild,client:Client){
		//Check whether the user is in a voicechannel
		const userInput = interaction.options.getString("input")
		const voiceChannel =  member.voice.channel;
		const textChannel = interaction.channel


		
		if(voiceChannel){
			await interaction.reply({content:`Joinned ${voiceChannel.name} `, ephemeral:false});
			const connection = joinVoiceChannel({
				channelId: voiceChannel.id,
				guildId: voiceChannel.guild.id,
				adapterCreator: voiceChannel.guild.voiceAdapterCreator as DiscordGatewayAdapterCreator,
			});
			//parsing input
			const song = await (await yts(userInput as string)).videos[0];

			// inside a command, event listener, etc.
			const ytSearchEmbed = new MessageEmbed()
				.setColor('#000000')
				.setTitle(`by ${song.author.name}`)
				.setURL(song.url)
				.setAuthor(`🎶 NOW PLAYING - ${song.title}`)
				.setDescription(song.description)
				.setThumbnail(song.thumbnail)			
			
			await (textChannel as TextBasedChannels).send({embeds: [ytSearchEmbed]});
			const mp3Stream = ytdl(song.url, { filter: 'audioonly' });
			const audioPlayer = createAudioPlayer()
			await audioPlayer.play(await probeAndCreateAudioResource(mp3Stream))
			await connection.subscribe(audioPlayer)
			return
		}else{
			await interaction.reply({content:`${member.displayName} please join a voice channel`, ephemeral:false});
			return 
		}
		
	},
};