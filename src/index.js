require("dotenv").config();

const discord = require("discord.js");
const { joinVoiceChannel, getVoiceConnections, createAudioResource, createAudioPlayer } = require("@discordjs/voice");
const { Client, Partials, GatewayIntentBits } = require("discord.js");

const client = new discord.Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates
    ]
});

let voiceConnection = null;
let interval = null;

let mp3FilePath = "./metal_pipe.mp3";
const voiceChannelID = '1066923077851697224';

client.on("ready", () => {
    console.log("Logged in!");

    for(vc of getVoiceConnections()){
        console.log(vc);
    }
})

const MIN_TIME = 3;
const MAX_TIME = 5 * 60;

let timeout = null;

function getRandomTime(){
    return Math.floor((Math.random() * (MAX_TIME - MIN_TIME) + MIN_TIME) * 1000);
}

function playSound(){

    let resource = createAudioResource(__dirname + "/metal_pipe.mp3", {inlineVolume: true});
    const player = createAudioPlayer();

    voiceConnection.subscribe(player);
    player.play(resource, {seek: 0, volume: Math.random() * 1.5 + 0.5});

    if (timeout != null && voiceConnection){
        timeout = setTimeout(playSound, getRandomTime());
    }

}

client.on('voiceStateUpdate', async (oldState, newState) => {
    const voiceChannel = client.channels.cache.get(voiceChannelID);

    if (voiceChannel.members.size > 0 && !voiceConnection) {

      voiceConnection = joinVoiceChannel({
        channelId: voiceChannelID,
        guildId: voiceChannel.guildId,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator
      });

      timeout = setTimeout(playSound, getRandomTime());
      
    } else if (voiceChannel.members.size === 1 && voiceConnection) {

      clearTimeout(timeout);

      voiceConnection.destroy();
      voiceConnection = null;
      console.log(`Left voice channel ${voiceChannel.name}`);

    }
  });

client.login(process.env.TOKEN);