import constants from "./constants";
import { Intents, Client, Collection } from "discord.js";
import fs from "fs";

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

client.on('interactionCreate', async interaction => {
    
    
    if(!interaction.isCommand()) return;

    const command = (client as any).commands.get(interaction.commandName);

	if (!command) return;
 
	try {
		await command.execute(interaction,interaction.member,interaction.guild,client);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
    

})


// add audio event listner that maintains the GuildMap / Track Queue when a song is finished

client.login(constants.TOKEN)