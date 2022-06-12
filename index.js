const Discord = require('discord.js');
const client = new Discord.Client({
    partials: [
        'MESSAGE', 'CHANNEL', 'REACTION'
    ],
    intents: [Discord.Intents.FLAGS.DIRECT_MESSAGES, Discord.Intents.FLAGS.DIRECT_MESSAGE_TYPING]
})
const extractUrls = require("extract-urls");
const {SauceNao} = require('saucenao.js');
const config = require('./config.json');

const {saucenao, allowed_channels} = config;
const sauce = new SauceNao({api_key: saucenao})

client.on("message", async message => {

    if (message.guild === null) {
        return;
    }

    if (message.attachments.size > 0) {
        let aaa = message
            .attachments
            .first();

        if (String(aaa.url).match(/\.(jpeg|jpg|png)$/) != null) {
            await message.react('😳');
            await message.react("🖕");

        }

    }
    if (!(message.attachments.size > 0)) {
        // var urlRegex = /(https?:\/\/[^ ]*)/; var find_url
        // =message.content.match(urlRegex)[1]; console.log(message.url)
        // console.log(message.content)

        let said = await extractUrls(message.content);
        // console.log(said)  var find_url = said[0].match(/\bhttps?:\/\/\S+/gi);
        // console.log(find_url[0])

        if (String(said).match(/\.(jpeg|jpg|png)$/) != null) {
            await message.react('😳');
            await message.react("🖕");

        }

    }

})

client.on('messageReactionAdd', async(reaction, user) => {

    if (!allowed_channels.includes(reaction.message.channel.id)) {

        return;
    }
    if (user.bot) {
        return;
    }

    if (reaction.message.channel.type == 'dm') {
        // console.log("private dm");
        return;
    }
    var input;
    const aaa = await reaction
        .message
        .channel
        .messages
        .fetch(reaction.message.id);

    aaa.attachments.size > 0
        ? input = aaa
            .attachments
            .first()
            .url
        : input = await extractUrls(aaa.content);;

    if (String(input).match(/\.(jpeg|jpg|gif|png)$/) == null) {
        return;
    }
    if (['🖕'].includes(reaction.emoji.name) && !user.bot) {

        user.send(`${input}`);
    }
    if (['😳'].includes(reaction.emoji.name) && !user.bot) {

        client
            .users
            .fetch(user.id, false)
            .then((user) => {
                sauce
                    .find({url: input})
                    .then((data) => {
                        const results = data.results[0].data.ext_urls;
                        const source = data.results[0].data.source;
                        if (results && source) {
                            user
                                .send(`Results:<${results}>\nSource:${source}\nFor: ${input}`)
                                .catch((e) => {})
                        };
                        if (results && typeof source === 'undefined') {
                            user
                                .send(`Results:<${results}>\nFor: ${input}`)
                                .catch((e) => {})

                        }
                        if (source && typeof results === 'undefined') {
                            user
                                .send(`Source:${source}\nFor: ${input}`)
                                .catch((e) => {})

                        }
                    })

            })
            .catch((e) => {
                console.log(e)
            })

    }

});

client.on('ready', async() => {
    console.log(`Logged in as ${client.user.tag}!
    :flushed: - To get the source of the image.
    :middle_finger: - To store the image in your dms(without source)
    `);
  });





client.login(config.token)