import Track from "track";
import { joinVoiceChannel ,DiscordGatewayAdapterCreator, CreateAudioPlayerOptions, createAudioPlayer, AudioResource } from "@discordjs/voice";
import { Snowflake } from "discord.js";


interface GuildQueueData{
    //structure of Guild
    guildId: Snowflake,
    channelId:Snowflake,
    enqueue:(url:string,title:string) => void,
    isEmpty:() => Boolean, 
    emptyQueue: () => void,
    display: () => Track[],
    playNext:()=> Promise<String>,
    pause:()=>void,
    resume:()=>void,
    
};

class GuildQueue implements GuildQueueData{
    
    public readonly guildId;
    public readonly channelId;
    private connection;
    private audioPlayer;
    private queue:Track[];
     
    
    constructor(guildId:Snowflake, channelId: Snowflake ,adapterCreator: DiscordGatewayAdapterCreator){
        this.guildId = guildId;
        this.channelId = channelId;
        this.connection = joinVoiceChannel({
            	channelId,
				guildId,
				adapterCreator,
        });
        this.audioPlayer = createAudioPlayer();
        this.connection.subscribe(this.audioPlayer);
        this.queue = [];  
    }

    public enqueue(url:string,title:string):void{
        //add promise to queue
        this.queue.push(new Track(url,title));
    }

    public isEmpty():boolean{
        if (this.queue.length == 0) return true
        else return false  
    }

    public emptyQueue(){
        //removes songs in the queue
        this.queue = []
    }

    public display(){
        return this.queue
    }

    public async playNext(){
        //Audioplayer plays the next track in the queue
       if(!this.isEmpty()){ 
           const track : Track = this.queue.pop() as Track
            try{
                const trackAudioResource : AudioResource = await track.getAudioResource()
                this.audioPlayer.play(trackAudioResource)  } 
            catch(e){
                this.playNext()
                return `Failed to load ${track.title} skip to next song`
            }
            return `Playing Next Song ${track.title}`
        }
        return `the Queue is Empty`
    }

    public async pause(){
        //audioplayer pauses music
        this.audioPlayer.pause()
    }

    public async resume(){
        //Audioplayer plays the next track in the queue
        this.audioPlayer.unpause()
    }
}

export default GuildQueue