import {AudioResource, createAudioResource, demuxProbe} from '@discordjs/voice';
import { raw as ytdl } from "youtube-dl-exec";

// Track interfaces with two libraries "youtube-dl-exec" and "discordjs/voices"
// It gets a stream of audio from yt then converts it into 
// a "AudioResource" which subsequently enables it to 
// be read by a "AudioPlayer"
// please refer to https://discordjs.github.io/voice/
// for further clarification
class Track{

    public url: string;
    public title: string; 

    public constructor(url:string,title:string){
        this.title = title
        this.url = url
    }

    /*
    * I plagerised this this I originally used "ytdl-core" which was a piece of shit 
    * @link: https://github.com/discordjs/voice/blob/main/examples/music-bot/src/music/track.ts
    */

	public createAudioResource(): Promise<AudioResource<Track>> {
		return new Promise((resolve, reject) => {

			const process = ytdl(
				this.url,
				{
					o: '-',
					q: '',
					f: 'bestaudio[ext=webm+acodec=opus+asr=48000]/bestaudio',
					r: '100K',
				},
				{ stdio: ['ignore', 'pipe', 'ignore'] },
			);

			if (!process.stdout) {
				reject(new Error('No stdout'));
				return;
			}
			const stream = process.stdout;
			const onError = (error: Error) => {
				if (!process.killed) process.kill();
				stream.resume();
				reject(error);
			};
			process
				.once('spawn', () => {
					demuxProbe(stream)
						.then((probe) => resolve(createAudioResource(probe.stream, { metadata: this, inputType: probe.type })))
						.catch(onError);
				})
				.catch(onError);
		});
	}

}

export default Track