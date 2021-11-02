import { SlashCommandBuilder } from '@discordjs/builders';
import {  CommandInteraction, GuildMember, MessageEmbed, TextBasedChannels } from 'discord.js';
import yts, { SearchResult, VideoSearchResult } from "yt-search";
import GuildQueue from "../interfaces/guildQueue";
import { ArtistsEntity, getPreview, getTracks, Preview } from 'spotify-url-info';
import ytsr from "ytsr";
import searchitunes from 'searchitunes';
import { getPlaylist } from "apple-music-playlist";
import sndcld from "soundcloud-scraper";

//array containing keywords to youtube list
const batchYoutubeConvert = async (tracks:Array<{ title: string , artist: string }>) => {
	
	let playlist:VideoSearchResult[] = [];
	
	for(let track of tracks){
	
		// search Youtube using both the title and artist name
		// this method is hit or miss 
		playlist.push((await ytsr(track.title + " " + track.artist,{ limit: 1}) as any).items[0])
	
	}

	return playlist

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
	async execute(interaction:CommandInteraction,member:GuildMember,guildQueue:GuildQueue){

		const userInput = interaction.options.getString("input") as string;
		const textChannel = interaction.channel;

		let playlist;
		let video;
		let embed;
		let paths : string[];

		// let discord know that request is being processed
		// extends reply time to 15 minutes
		await interaction.deferReply()

		if(/^https?:\/\/([\w\d\-]+\.)+\w{2,}(\/.+)?$/.test(userInput)){
			const url = new URL(userInput);
			url.searchParams.delete('t');
			switch(true){

				case url.hostname.includes("youtube") || url.hostname.includes("youtu.be")   :
					
					if(url.searchParams.get("list")){

						let index = Number(url.searchParams.get("index")) || 0 
						
						playlist = await yts({listId: url.searchParams.get("list") as any})

						embed = new MessageEmbed()
						.setColor('#FF7F7F')
						.setTitle(`by ${playlist.author.name}`)
						.setURL(playlist.url)
						.setAuthor(playlist.title)
						.setImage(playlist.thumbnail)	

						playlist = playlist.videos.slice(index,-1)
						
					}else{
						video = (await yts(url.toString())).videos[0]
						

						embed = new MessageEmbed()
							.setColor('#FF7F7F')
							.setTitle(`by ${video.author.name}`)
							.setURL(video.url)
							.setAuthor(video.title)
							.setImage(video.thumbnail)			
							
					}

					break;

				case url.hostname.includes("spotify") :

					let spotifyTrackData = await getPreview(userInput)


					embed = new MessageEmbed()
						.setColor('#90ee90')
						.setTitle(`by ${spotifyTrackData.artist}`)
						.setURL(spotifyTrackData.link)
						.setAuthor(spotifyTrackData.title)
						.setImage(spotifyTrackData.image)
						
					


						if(spotifyTrackData && spotifyTrackData.type !== "track" ){							
							/* 
								This is very janky there is no two ways about it 
							*/					
							embed.title = spotifyTrackData.title
							embed.author = null

							let trackData = await getTracks(userInput)
														
							playlist = await batchYoutubeConvert(Array.from(trackData,(data) => 
								({title: data.name , artist: (data.artists as ArtistsEntity[])[0].name })
								)
							)							
							

						}else if(spotifyTrackData.type === "track" ){							
							
							video = (await ytsr((spotifyTrackData as Preview).title + " " + (spotifyTrackData as Preview).artist, { limit: 1})).items[0]

						}	

					break;

				case url.hostname.includes("apple"):
					
					paths = url.pathname.split("/")
							

					if(paths[2] = "playlist"){
						//playlist
						try{
							
							let itunesData = await getPlaylist(url.toString())

							embed = new MessageEmbed()
								.setColor('#FFFFFF')
								.setTitle("Soz apple is kinda uhhh ooh stinky")
								.setURL(url.toString())
								.setAuthor(paths[3].replace(/-/g," "))
							
						
							playlist = await batchYoutubeConvert(Array.from(itunesData, (x: {title:string , artist:string}) => ({ title:x.title , artist: x.artist})))
						
						}catch(e){
							console.log(e)
						}

					}
					
					if(url.searchParams.get("i")){

						try{

							let itunesData = await searchitunes({id: url.searchParams.get("i") }); 				

							embed = new MessageEmbed()
								.setColor('#FFFFFF')
								.setTitle(`by ${itunesData.artistName}`)
								.setURL(itunesData.collectionViewUrl)
								.setAuthor(itunesData.collectionName)
								.setImage(itunesData.artworkUrl100)
							
							video = (await ytsr(itunesData.trackName + " " + itunesData.artistName,{ limit: 1})).items[0]
						
						}catch(e){
							console.log(e)
						}
						
					}

					break;

				// case url.hostname.includes("soundcloud"):
					
				// 	paths = url.pathname.split("/");

				// 	console.log(paths)

				// 	if(paths.includes("sets")){
				// 		console.log("playlist")

				// 	}

				// 	if(!paths.includes("sets") && paths.length == 3){
				// 		console.log("song")

				// 	// let sndcldData = await sndcld.getSong(url.toString())
				// 	// embed = new MessageEmbed()
				// 	// 	.setColor('#FFFFFF')
				// 	// 	.setTitle(`by ${itunesData.artistName}`)
				// 	// 	.setURL(itunesData.collectionViewUrl)
				// 	// 	.setAuthor(itunesData.collectionName)
				// 	// 	.setImage(itunesData.artworkUrl100)
					
					
					
				// }
				// break;
  
			}
		}else{
			video = (await yts(userInput)).videos[0]

			embed = new MessageEmbed()
				.setColor('#000000')
				.setTitle(`by ${video.author.name}`)
				.setURL(video.url)
				.setAuthor(video.title)
				.setImage(video.thumbnail)	



		}

			if(playlist){

				if((playlist as any).length < 550 ){
					
					await interaction.editReply({ content : "🎶 playlist is now being added to queue "})
					
					await (textChannel as TextBasedChannels).send({embeds: [embed as MessageEmbed]});
					
					guildQueue.batchEnqueue(playlist as any)
					
					return 
				}else{
					await interaction.editReply({ content : " playlist too big please try a different playlist needs to be less than 550"})
					return 
				}
			}
			
			if(video){

			
				// inside a command, event listener, etc.

				//adds song to the queue
				await guildQueue.enqueue((video as any).url, (video as any).title)

				
				await (textChannel as TextBasedChannels).send({embeds: [embed as MessageEmbed]});
				await interaction.editReply({ content: "🎶 added to queue" })
				return
			}

				await interaction.editReply({ content: "Don't recognise that Sawwwy UwU " })
				return
						
	},
};