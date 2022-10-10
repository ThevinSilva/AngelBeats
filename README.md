# AngelBeats

![Tux, the Linux mascot](./angelBeats.png)

A discord bot that plays music...

Now supports <B>Spotify</B> , <B>Youtube</B> , <B>Soundcloud</B> and <B>Apple Music</B>

## Commands

Current list of commands.
|command |description|
|--|--|
| /play - input | input - youtube link (video or playlist) or keyword |
| /pause | pauses music |
| /resume | remuses music |
| /queue| displays all tracks in the queue |
| /join | join's your voice channel |
| /leave| leave's your voice channel |
| /remove | removes last added entry to queue |
| /skip | skip's next track in queue|
| /shuffle | shuffles the queue |

## Requirements

All of these bar ffmpeg are on npm. There is the option to use ffmpeg-static but my experience with the library has been varied

- ffmpeg
- Youtube-dl-exec
- Discord.js
- discordjs/voice
- TypeScript

check the package.json incase I missed something

## Usage

- running locally remember to install all the dependecies

```
	npm install
```

- transpile to javascript before **requires** Typescript compiler

```
	npm run build
```

- to deploy new commands

```
	npm run deploy
```

- to start the bot

```
	npm start
```

## Development

- With in the main "src" file , the "commands" folder contains modules of all the commands.

- The "interfaces" folder contains two structures.

- A "GuildMap" which is a hashtable with a server's id as a key which maps to a structure called a "guildQueue" .
- A "guildQueue" consists of "Tracks"/songs , a "AudioPlayer" (discordjs/voice) as well as other built-in functionality that interface with different components and simplify writing command.

### SUCESS CRITERIA

1. finish boiler plate ✔️
2. implement command parser ✔️
3. implement ytdl-core ✔️
4. implement FFMPEG Stream ❌ --> implement youtube-dl ✔️
5. implement Guild/server hash-table/store ✔️
6. implement command play ✔️
7. implement commands
   - join✔️
   - pause✔️
   - resume✔️
   - skip✔️
   - leave✔️
   - shuffle✔️
   - queue✔️
   - remove✔️

### Notes

- Documentation refers to discord "servers" as "guilds"
- Age Restricted songs will not play if hosted in the EU
