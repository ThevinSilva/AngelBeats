import { Guild, GuildMember, Snowflake } from "discord.js";
import GuildQueue from "./guildQueue";

interface GuildMapData {
    map: Map<Snowflake,GuildQueue>, // Snowflake = GuildID
}

// don't need to reinvent the wheel 
// simply need to check whether a certain key exists
// before entering new data
const guildMap = new Map()

export default guildMap