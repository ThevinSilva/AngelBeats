import constants from "./constants";
import { Intents, Client, Collection, GuildMember } from "discord.js";
import { Snowflake } from "discord.js";
import fs from "fs";
import GuildQueue from "./guildQueue";
import { DiscordGatewayAdapterCreator } from "@discordjs/voice";


//BOT token used to login to discord

//create a new Client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES] });

//NOTE : this is bad practise apparently will I fix it no 
(client as any).commands = new Collection();

const commandFiles:string[] = fs.readdirSync("./src/commands")
    .filter(file => file.endsWith(".ts") || file.endsWith(".js") )

//adding commands to the collection at the start of the program

for(let file of commandFiles){
    console.log(file)
    const command = require(`./commands/${file.split(".")[0]}.js`);
    (client as any).commands.set(command.data.name,command )
}


client.once("ready", () => {
    console.log("ready")
})



//global hash table of servers/guilds each server property contains a queue of songs


const guildMap:Map<Snowflake,GuildQueue> = new Map()




client.on('interactionCreate', async interaction => {
    
    
    if(!interaction.isCommand()) return;

    const command = (client as any).commands.get(interaction.commandName);
    const voiceChannel =  (interaction.member as GuildMember).voice.channel;
    const member : GuildMember = interaction.member as GuildMember

	if (!command) return;
    //check whether a guild exists in the guildMap if not create an entry
	if(interaction.guildId){
        if(voiceChannel){
            
            if(!Array.from(guildMap.keys()).includes(interaction.guildId)){

                    guildMap.set(interaction.guildId,
                        new GuildQueue(
                            interaction.guildId, 
                            voiceChannel.id,
                            voiceChannel.guild.voiceAdapterCreator as DiscordGatewayAdapterCreator
                        )
                    )

                }

                const guildQueue = guildMap.get(interaction.guildId)
                //commands gets executed
                try {
                    await command.execute(interaction,interaction.member,guildQueue);
                } catch (error) {
                    console.error(error);
                    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
                }
        
            }
            else{
                await interaction.reply({content:`${member.displayName} please join a voice channel`, ephemeral:false}); 
                return 
            }


        
    }
})



// add audio event listner that maintains the GuildMap / Track Queue when a song is finished

client.login(constants.TOKEN)