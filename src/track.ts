import {AudioResource, createAudioResource, demuxProbe} from '@discordjs/voice';
import ytdl from 'ytdl-core';

// Track interfaces two libraries yt-dl and discord/voices
// It gets a stream of audio from yt then converts it into 
// a "AudioResource" which subsequently enables it to 
// be read by a "AudioPlayer"
// please refer to https://www.npmjs.com/package/ytdl-core#ytdlchooseformatformats-options
// for further clarification
class Track{

    //NOTE : typescript doesn't want to recognise "Readable" as a type I'm sorry
    // I know this is bad practise
    public ytStream: any;
    public title: string; 

    constructor(url:string,title:string){
        this.title = title
        this.ytStream = ytdl(url, { filter: 'audioonly' });
    }

    public async getAudioResource():Promise<AudioResource>{
	    const { stream , type } = await demuxProbe(this.ytStream);
	    return createAudioResource(stream, { inputType : type})
    }

}

export default Track