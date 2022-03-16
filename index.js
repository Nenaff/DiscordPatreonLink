const Discord = require('discord.js');
const client = new Discord.Client({ intents: ['GUILDS', 'GUILD_MESSAGES'] });

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

global.db = require('./database');
global.patreon = require('./patreon');

client.on('messageCreate', async (message) => {
    let author = message.author;
    author.id = '274999371144364033'
    let command = message.content.split(" ")[0];
    let args = message.content.split(" ").slice(1);
    switch (command) {
        case "+ping": // free command
            message.reply({ content: 'pong!'})
            break;
        case "+help":
            message.reply("`+verify` Associe automatiquement votre compte Patreon et votre compte Discord.\n`+userpremium` Affiche l'état de votre abonnement.\n`+serverpremium` Affiche l'état du premium du serveur.\n`+makepremium` Rend premium le serveur où vous utilisez la commande si vous disposez d'un abonnement.")
            break;
            
        case "+verify":
            let verification = await patreon.verifyPatron(author.id);
            message.reply({ embeds: [embed(verification.success, verification.success ? "Verification success" : "Verification failed", verification.message)]});
            break;
        case "+makepremium":
            let isSubscribed = await patreon.isUserSubscribed(author.id); 
            if (isSubscribed) {
                let addServer = await patreon.addServerToPatron(message.guildId, author.id, isSubscribed);
                console.log(addServer)
                message.reply({ embeds: [embed(addServer.success, (addServer.success ? "This server is now premium" : "Couldn't make this server premium"), addServer.message)]});
            } else {
                message.reply({ embeds: [embed(false, "This command is for premium users only.", "Sign up for a subscription on our Patreon, link your Discord account, then use `+verify`.")]});
            }
            break;

        case "+userpremium":
            let isSubscribed2 = await patreon.isUserSubscribed(author.id); 

            if (isSubscribed2) {
                let tier = patreon.getTierFromId(isSubscribed2['tier']);
                message.reply({ embeds: [embed(true, "You have an active subscription to our Patreon.", `Next charge: ${new Date(isSubscribed2['next_charge']).toLocaleString()}\nTier: ${tier[0]}\nPremium servers: ${await patreon.countPremiumServers(author.id)}/${tier[1]}`)]});
            } else {
                message.reply({ embeds: [embed(false, "You're not currently subscribed to Patreon.", "Sign up for a subscription on our Patreon, link your Discord account, then use `+verify`.")]});
            }
            break;
        case "+serverpremium":
            let isServerPremium = await patreon.isServerPremium(message.guildId); 
            if (isServerPremium) {
                message.reply({ embeds: [embed(true, "This server is premium !", `Thanks to subscribed user with ID : ${(await patreon.findServerOwner(message.guildId)).owner_discord_id}`)]});
            } else {
                message.reply({ embeds: [embed(false, "This server is not premium.", "If you have a valid Patreon subscription, you can make it premium by using `+makepremium`.")]});
            }
            break;
    }
})

function embed(success, title, description) {
    return new Discord.MessageEmbed()
    .setTitle((success ? "Success" : "Error") + " : " + title)
    .setColor(success ? "#36ff6b" : "#ff0000")
    .setDescription(description)
    .setTimestamp()
}

client.login('NDE1NTk5OTg3NTMyMTAzNjgx.Wox_pg.d7XTs62rpLqK7VTTDimxwnAiylI');