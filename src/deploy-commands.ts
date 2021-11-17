//script used to deploy commands note this isn't used by the bot 
import {REST} from "@discordjs/rest";
import fs from 'fs';
import { Routes } from "discord-api-types/v9";
import constants from "./constants";


const commands:any[] = [];
const commandFiles:string[] = fs.readdirSync("./src/commands").filter(file => file.endsWith(".ts") || file.endsWith(".js") )


console.log(commandFiles)
for(let item of commandFiles){
	//get's transpilled to javascript 
	//fix: change file type
	const command = require(`./commands/${item.split(".")[0]}.js`);
	commands.push(command.data.toJSON());
}


const rest = new REST({ version: '9' }).setToken(constants.TOKEN);

(async () => {
	try {
		console.log('Started refreshing application (/) commands.');

		await rest.put(
			//remove the constants.GUILD_ID parameter 
			// Routes.applicationCommands(constants.CLIENT_ID),
			Routes.applicationGuildCommands(constants.CLIENT_ID, constants.GUILD_ID),
			{ body: commands },
		);

		console.log('Successfully reloaded application (/) commands.');
	} catch (error) {
		console.error(error);
	}
})();
