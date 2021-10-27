import "dotenv/config";


export default {
    TOKEN: process.env.BOT_TOKEN as string,
    GUILD_ID: process.env.SERVER_ID as string,
    CLIENT_ID: process.env.CLIENT_ID as string 

}