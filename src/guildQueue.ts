import Track from "./track";
import {joinVoiceChannel ,
        DiscordGatewayAdapterCreator,
        createAudioPlayer,
        AudioResource,
        AudioPlayerStatus 
} from "@discordjs/voice";
import { Snowflake } from "discord.js";
// import util from "util";


interface GuildQueueData{
    //structure of Guild
    guildId: Snowflake,
    channelId:Snowflake,
    enqueue:(url:string,title:string) => Promise<void>,
    isEmpty:() => Boolean, 
    stop: () => void,
    display: () => Track[],
    playNext:() => Promise<void>,
    pause:() => Promise<Boolean>,
    resume:() => Promise<Boolean>,

    
};

class GuildQueue implements GuildQueueData{
    
    public readonly guildId;
    public readonly channelId;
    private playing;
    private connection;
    private audioPlayer;
    private queue:Track[];
     
    
    public constructor(guildId:Snowflake, channelId: Snowflake ,adapterCreator: DiscordGatewayAdapterCreator){
        this.guildId = guildId;
        this.channelId = channelId;
        this.playing = false; 
        this.connection = joinVoiceChannel({
            	channelId,
				guildId,
				adapterCreator,
        });
        this.audioPlayer = createAudioPlayer();
        this.connection.subscribe(this.audioPlayer);
        this.queue = [];


		this.audioPlayer.on('stateChange', (oldState, newState) => {
            console.log("oldState",oldState.status)
            console.log("newstate",newState.status)
            if(newState.status === AudioPlayerStatus.Idle && oldState.status !== AudioPlayerStatus.Idle){
                this.playing = false
                this.playNext()
            }else{
                this.playing = true
            }
            console.log(this.playing)
		});



    }

    public async enqueue(url:string,title:string){
        //add promise to queue
        this.queue.push(new Track(url,title));
        this.playNext()
    }

    public isEmpty():boolean{
        if (this.queue.length == 0) return true
        else return false  
    }

    public stop(){
        //removes songs in the queue
        this.audioPlayer.stop()
        this.queue = []
    }

    public display(){
        return this.queue
    }

    public async playNext(){
        // dequeueing from the queue
        //Audioplayer plays the next track in the queue
       if(!this.isEmpty() && !this.playing){ 
           const track : Track = this.queue.shift() as Track
            try{
                const trackAudioResource : AudioResource = await track.createAudioResource()
                this.audioPlayer.play(trackAudioResource)  
            } 
            catch(e){
                this.playNext()
                // Fails loading a track
                console.log(e)
            }
            // plays
            
        }
        
    }

    public async pause(){
        //audioplayer pauses music
        if (this.audioPlayer.state.status != AudioPlayerStatus.Paused){            
            this.audioPlayer.pause()
            return true        
        }
        else{
            return false
        }
    }

    public async resume(){
        //Audioplayer plays the next track in the queue
        if (this.audioPlayer.state.status == AudioPlayerStatus.Paused){
            this.audioPlayer.unpause()
            return true
        }
        else{
            return false
        }
    }



    /** 
    * checks whether the audio player is currently idle  
    * @summary If the description is long, write your summary here. Otherwise, feel free to remove this.
    */

}

export default GuildQueue