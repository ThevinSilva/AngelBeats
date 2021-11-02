import Track from "./track";
import {joinVoiceChannel ,
        DiscordGatewayAdapterCreator,
        createAudioPlayer,
        AudioResource,
        AudioPlayerStatus, 
        VoiceConnectionStatus,
        VoiceConnectionDisconnectReason,
        entersState
} from "@discordjs/voice";
import { Snowflake } from "discord.js";
import { promisify } from 'node:util';

const wait = promisify(setTimeout)

/* 
    Each Server/Guild contains one audioPlayer.
    I wrote a adapter class that represents the queue that each Discord Server controlls.
    It snowballed into kind of a monolith so I will try to explain any intricacies as best 
    I can...
    Refactor note This ended up plagerising this
    @link - https://github.com/discordjs/voice/blob/main/examples/music-bot/src/music/subscription.ts
*/

// ADD AUTO TIMEOUT function 

interface GuildQueueData{
    //structure of Guild
    guildId: Snowflake, //GuildId property of interaction
    channelId:Snowflake,//voice.channel property of interaction
    MAX: number,// maximum number of items allowed in the queue
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
    
    public readonly MAX;
    public readonly guildId;
    public channelId;
    private queue:Track[];
    private readyLock: Boolean;
    private playing;
    private connection;
    private audioPlayer;
    private removeGuild: () => Promise<void>;
     
    
    public constructor(guildId:Snowflake, channelId: Snowflake ,adapterCreator: DiscordGatewayAdapterCreator, callback:() => Promise<void>){
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
        this.readyLock = false;
        this.queue = [];
        this.removeGuild = callback;
        this.MAX = 550

        // Event Listener - listen do Disconnect
        this.connection.on('stateChange', async (_, newState) => {
            if(newState.status === VoiceConnectionStatus.Disconnected){
                if(newState.reason === VoiceConnectionDisconnectReason.WebSocketClose && newState.closeCode == 4014){

                   try {
                       // Probably moved voice channel
						await entersState(this.connection, VoiceConnectionStatus.Connecting, 5_000);
					} catch {
						// Probably removed from voice channel
                        this.destroy();
					}

                } else if (this.connection.rejoinAttempts < 5) {
					/*
						The disconnect in this case is recoverable, and we also have <5 repeated attempts so we will reconnect.
					*/
					await wait((this.connection.rejoinAttempts + 1) * 5_000);
					this.connection.rejoin();
				} else {
					/*
					    The disconnect in this case may be recoverable, but we have no more remaining attempts - destroy.
					*/
					this.destroy();
				}
                
            }else if(!this.readyLock && 
                (newState.status === VoiceConnectionStatus.Connecting || newState.status === VoiceConnectionStatus.Signalling)){
                    this.readyLock = true;

				/*
					In the Signalling or Connecting states, we set a 20 second time limit for the connection to become ready
					before destroying the voice connection. This stops the voice connection permanently existing in one of these
					states.
				*/

                    try{
                        await entersState(this.connection, VoiceConnectionStatus.Ready, 20_000);
                    }catch(e){
                        if (this.connection.state.status !== VoiceConnectionStatus.Destroyed) this.destroy();
                    }finally{
                        this.readyLock = false;
                    }
                }

        })

        // Event Listener - When BOT becomes idle next track is played
		this.audioPlayer.on('stateChange', (oldState, newState) => {
            if(newState.status === AudioPlayerStatus.Idle && oldState.status !== AudioPlayerStatus.Idle){
                this.playing = false
                this.playNext()
            }else{
                this.playing = true
            }
		});



    }

    /* 
        NOTE: Dear future me or anyone else looking at this monolith
        why is everything async u might ask and the answer is "performance" innit
    */

    public async enqueue(url:string,title:string){
        //add promise to queue
        if(this.queue.length < this.MAX){

            this.queue.push(new Track(url,title));
            
            this.playNext()
        
        }
    }

    public async batchEnqueue(videos:Array<any>){
        for(let video of videos){
            if(this.queue.length < this.MAX && video){
            
                this.queue.push(new Track(
                `http://www.youtube.com/watch?v=${video.videoId || video.id}`,
                video.title
            ));

            }
        }

        this.playNext()
    }

    public isEmpty():boolean{
        if (this.queue.length == 0) return true
        else return false  
    }

    public destroy(){
        //removes songs in the queue
        this.connection.destroy()
        this.audioPlayer.stop(true)
        this.removeGuild().
            then(() => {
                console.log(" Guild has been removed ")
            })
            
    }

    /*
        Getter method for queue
    */
    public display(){
        // returns queue
        return this.queue
    }

    /*
        shuffles the order of the queue
        implements Fisher Yates(Kuth) Shuffle
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
           let trackAudioResource : AudioResource; 
           try{
                let url = new URL(track.url)
                if(url.hostname.includes("soundcloud")) trackAudioResource = await track.createAudioResourceSoundcloud()
                else  trackAudioResource  = await track.createAudioResource() 
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