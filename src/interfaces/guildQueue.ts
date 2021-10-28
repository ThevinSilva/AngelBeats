import Track from "./track";
import {joinVoiceChannel ,
        DiscordGatewayAdapterCreator,
        createAudioPlayer,
        AudioResource,
        AudioPlayerStatus 
} from "@discordjs/voice";
import { Snowflake } from "discord.js";

/** 
* Each Server/Guild contains one audioPlayer.
* I wrote a adapter class that represents the queue that each Discord Server controlls.
* It snowballed into kind of a monolith so I will try to explain any intricacies as best 
* I can...
*/



interface GuildQueueData{
    //structure of Guild
    guildId: Snowflake, //GuildId property of interaction
    channelId:Snowflake,//voice.channel property of interaction
    enqueue:(url:string,title:string) => Promise<void>,//adds 
    batchEnqueue:<T>(videos:Array<T>) => Promise<void>,
    isEmpty:() => Boolean, 
    destroy: () => void,
    display: () => Track[],
    playNext:(forced? : boolean) => Promise<void>,
    pause:() => Promise<void>,
    resume:() => Promise<void>,
    pop:()=> Track
};

class GuildQueue implements GuildQueueData{
    
    public readonly guildId;
    public channelId;
    private queue:Track[];
    private playing;
    private connection;
    private audioPlayer;
     
    
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

    /* 
    * NOTE: Dear future me or anyone else looking at this monolith
    * why is everything async u might ask and the answer is "performance" innit
    */

    public async enqueue(url:string,title:string){
        //add promise to queue
        this.queue.push(new Track(url,title));
        this.playNext()
    }

    public async batchEnqueue(videos:Array<any>){
        
        for(let video of videos){
            this.queue.push(new Track(
                `http://www.youtube.com/watch?v=${video.videoId}`,
                video.title
            ));
        }

        this.playNext()
    }

    public isEmpty():boolean{
        if (this.queue.length == 0) return true
        else return false  
    }

    public destroy(){
        //removes songs in the queue
        this.audioPlayer.stop()
        this.connection.destroy()
        
    }

    /*
    * Getter method for queue
    */
    public display(){
        return this.queue
    }

    /*
    * shuffles the order of the queue
    * implements Fisher Yates(Kuth) Shuffle
    */
    public async shuffle(){
        

        for(let i = this.queue.length - 1; i >= 0  ; i--){
        
            let rand = Math.floor(Math.random() * i)
            let temp = this.queue[i]
            this.queue[i] = this.queue[rand]
            this.queue[rand] = temp
        
        }


    }

    public async playNext(forced?:boolean){
        
        // dequeueing from the queue
        //Audioplayer plays the next track in the queue
       if(forced || (!this.isEmpty() && !this.playing)){ 
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
    
    public connectionChanger(channelId: Snowflake, adapterCreator:DiscordGatewayAdapterCreator) {
        this.connection = joinVoiceChannel({
            	channelId,
				guildId : this.guildId,
				adapterCreator,
        });
        this.channelId = channelId
    }

    
    public async pause(): Promise<void>{
        if (this.audioPlayer.state.status != AudioPlayerStatus.Paused){            
            this.audioPlayer.pause()           
        }

    }

    public async resume(){
        if (this.audioPlayer.state.status == AudioPlayerStatus.Paused){
            this.audioPlayer.unpause()   
        }

    }

    public pop() {
        return this.queue.pop() as Track
    }



}

export default GuildQueue