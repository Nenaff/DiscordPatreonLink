const Discord = require('discord.js');
const client = new Discord.Client({ intents: ['GUILDS', 'GUILD_MESSAGES'] });

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

global.patreon = require('./patreon');

console.log(patreon)

client.on('messageCreate', async (message) => {
    let author = message.author;
    let command = message.content.split(" ")[0];
    let args = message.content.split(" ").slice(1);
    switch (command) {
        case "+ping": // free command
            message.reply({ content: 'pong!'})
            break;
        case "+verify":
            let verification = await patreon.verifyPatron(author.id, args[0]);
            message.reply({ embeds: [embed(verification.success, verification.success ? "Verification success" : "Verification failed", verification.message)]});
            break;
        case "+paytest": // paid command
            let isPatron = await patreon.isPremium(author.id); 
            if (isPatron) {
                message.reply(`You're a premium user ! :tada: :tada:\nYour data: \`\`\`${patron.paidUsers[author.id]}\`\`\`\``);
            } else {
                message.reply({ embeds: [embed(false, "This command is for premium users only.", "Souscrivez un abonnement sur notre Patreon, liez votre compte Discord, puis utilisez `+verify`.")]});
            }
            break;
        case "+clear":
            patron.paidUsers = {}
            message.reply('Emptied premium user list.');
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

client.login('Your token');