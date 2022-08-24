# `discord-player`

A complete framework to simplify the implementation of music commands for Discord bots

# Example

```ts
import { Player } from "discord-player";

// a client can be any discord client (discord.js, eris, etc.)
const client = getDiscordClientSomehow();
const player = new Player();

player.on("payload", (guild, payload) => {
    client.guilds.cache.get(guild)?.shard.send(payload);
});

client.ws.on("VOICE_SERVER_UPDATE", (data) => {
    player.onServerUpdate({ t: "VOICE_SERVER_UPDATE", d: data });
});

client.ws.on("VOICE_STATE_UPDATE", (data) => {
    player.onServerUpdate({ t: "VOICE_STATE_UPDATE", d: data });
});

client.onCommand("join", async (ctx) => {
    const voiceChannel = ctx.member.voice.channel;
    if (!voiceChannel) return ctx.reply("You are not in a voice channel!");
    const queue = await player.queues.create({
        clientId: client.user.id,
        guildId: ctx.guild.id
    });
    queue.join(voiceChannel.id);
});
```

# Work in Progress