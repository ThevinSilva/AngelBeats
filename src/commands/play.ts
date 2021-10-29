import { SlashCommandBuilder } from '@discordjs/builders';
import {  CommandInteraction, GuildMember, MessageEmbed, TextBasedChannels  } from 'discord.js';
import yts from "yt-search";
import GuildQueue from "../interfaces/guildQueue";



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
	async execute(interaction:CommandInteraction,member:GuildMember,guildQueue:GuildQueue){
		const userInput = interaction.options.getString("input") as string;
		const playlistId = userInput.match(/^.*(youtu.be\/|list=)([^#\&\?]*).*/);
		const textChannel = interaction.channel

		console.log(playlistId)

		if(playlistId && playlistId[2]){
			const playList = await yts({listId: playlistId[2]})

			if(playList.videos.length < 550 ){
				await interaction.reply({ content : " playlist is now being added to queue "})

				const playListEmbed = new MessageEmbed()
					.setColor('#FFFFFF')
					.setTitle(`by ${playList.author.name}`)
					.setURL(playList.url)
					.setAuthor(playList.title)
					// .setDescription(song.description)
					.setImage(playList.thumbnail)	


				await (textChannel as TextBasedChannels).send({embeds: [playListEmbed]});
				guildQueue.batchEnqueue(playList.videos)
				return 
			}else{
				await interaction.reply({ content : " playlist too big please try a different playlist needs to be less than 550"})
				return 
			}

		}else{
			console.log("something common")

			const song = (await yts(userInput)).videos[0];
		
			// inside a command, event listener, etc.
			const ytSearchEmbed = new MessageEmbed()
			.setColor('#000000')
			.setTitle(`by ${song.author.name}`)
			.setURL(song.url)
			.setAuthor(song.title)
			// .setDescription(song.description)
			.setImage(song.thumbnail)			
			
			//adds song to the queue
			await guildQueue.enqueue(song.url, song.title)

			
			await (textChannel as TextBasedChannels).send({embeds: [ytSearchEmbed]});
			interaction.reply({ content: "🎶 added to queue" })
		}	
		
	},
};