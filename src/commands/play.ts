import { SlashCommandBuilder } from '@discordjs/builders';
import {  CommandInteraction, GuildMember, MessageEmbed, TextBasedChannels  } from 'discord.js';
import yts from "yt-search";
import GuildQueue from "../guildQueue";



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
		const song = (await yts(userInput)).videos[0];
		const empty = guildQueue.isEmpty();

		
		const textChannel = interaction.channel
		
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

		
	},
};