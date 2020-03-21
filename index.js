const { Client, MessageEmbed } = require("discord.js");
const moment = require("moment");
const axios = require("axios");
const config = require("./config.json");

const client = new Client({
  disableMentions: "true"
});

client.on("ready", () => {
  console.log(`[BOT] is online as ${client.user.username}`);
  client.user.setPresence({
    status: "online",
    game: {
      name: `${config.prefix}.swap`,
      type: "WATCHING"
    }
  });
});

client.on("message", async message => {
  if (message.author.bot) return;
  if (!message.guild) return;
  if (!message.content.startsWith(config.prefix)) return;

  // Make sure only messages are sent in that dedicated channel
  if (message.channel.id != config.channel) return;

  const args = message.content
    .slice(config.prefix.length)
    .trim()
    .split(/ +/g);
  const cmd = args.shift().toLowerCase();

  if (cmd == "swap-details") {
    // Get the request based on the args provded
    let request = axios
      .get(`${config.api}/id/${args.toString()}`)
      .then(res => {
        // If the user isn't the one who initiated the request, then don't let them view it
        if (message.author.id != res.data.discordId) {
          message.channel.send(
            `:x: ${message.author}, you are not authorised to view the requested Migration!`
          );
          message.delete();
          return;
        }

        // If a couple fields are empty, replace with N/A
        if (res.data.receivingHash == "") {
          res.data.receivingHash = "Not Detected";
        }
        if (res.data.sent_hash == "") {
          res.data.sent_hash = "N/A";
        }

        msg = new MessageEmbed()
          .setTitle("Feirm Blockchain Migration")
          .setColor("0xFF6900")
          .setThumbnail("https://feirm.com/img/logo.3bad5560.png")
          .setDescription(
            `${message.author}, here is an update for your request.`
          )
          .addField("Request ID", res.data.id)
          .addField(
            "Date Created",
            `${moment.unix(res.data.timestamp).format("DD-MM-YYYY HH:mm")}`
          )
          .addField("Status", `${res.data.status}`)
          .addField("Incoming TXID (Old blockchain)", res.data.receivingHash)
          .addField("Outgoing TXID (New blockchain)", res.data.sent_hash)
          .addField("Amount", `${res.data.amount} XFE`);

        message.author
          .send(msg)
          .then(() => {
            message.channel.send(
              `:white_check_mark: ${message.author}, I've sent you a PM! It should contain an update on your request!`
            );
          })
          .catch(() =>
            message.channel.send(
              `❌ ${message.author}, I couldn't send you a PM. Please enable your PMs and then try the command again!`
            )
          );
      })
      .catch(error => {
        // Error embed
        let errorEmbed = new MessageEmbed()
          .setTitle("Feirm Blockchain Migration")
          .setColor("0xFF0000")
          .setThumbnail("https://feirm.com/img/logo.3bad5560.png")
          .setDescription(
            `${message.author}, it seems we had an issue getting your migration request!`
          )
          .addField("Reason", "```\n" + error.response.data.error + "\n```")
          .setFooter(
            "Made with ❤️ by the Feirm developers",
            "https://feirm.com/img/logo.3bad5560.png"
          )
          .setTimestamp();

        message.author
          .send(errorEmbed)
          .then(() => {
            message.channel.send(
              `:white_check_mark: ${message.author}, I've sent you a PM!`
            );
          })
          .catch(() =>
            message.channel.send(
              `❌ ${message.author}, I couldn't send you a PM. Please enable your PMs and then try the command again!`
            )
          );
        message.delete();
      });
  }

  if (cmd === "swap") {
    // Carry out the request to the API and generate a migration request
    params = {
      discordId: message.author.id,
      receivingAddress: args.toString()
    };

    let request = axios
      .post(`${config.api}/requests/generate`, params)
      .then(res => {
        // Message embed
        let returnEmbed = new MessageEmbed()
          .setTitle("Feirm Blockchain Migration")
          .setColor("0xFF6900")
          .setThumbnail("https://feirm.com/img/logo.3bad5560.png")
          .setDescription(
            `${message.author}, please read through the instructions mentioned in this message! Note that there is a timeout placed on this request! If you happen to send funds after the request has expired, **you will lose your funds!**`
          )
          .addField("Swap Request ID", `**${res.data.id}**`)
          .addField(
            "Your Deposit Address",
            "```\n" + res.data.depositAddress + "\n```"
          )
          .addField(
            "Step 1",
            `Send all of your XFE to the **Deposit Address** above by **${moment
              .unix(res.data.timestamp + 7200)
              .format("DD-MM-YYYY HH:mm")}**.`
          )
          .addField(
            "Step 2",
            "Once our systems detect a transaction made to the deposit address, your transaction will be added into the queue to be processed!"
          )
          .addField(
            "Step 3",
            "Within 6 confirmations, the amount you sent which resides at the Deposit Address will then be sent to the address you provided when first running the swap command. That's it!"
          )
          .addField(
            "Monitor your Migration Request",
            `https://migration.feirm.com/id/${res.data.id}`
          )
          .setFooter(
            "Made with ❤️ by the Feirm developers",
            "https://feirm.com/img/logo.3bad5560.png"
          )
          .setTimestamp();

        message.author
          .send(returnEmbed)
          .then(() => {
            message.channel.send(
              `:white_check_mark: ${message.author}, I've sent you a PM! Please give it a read for further instructions!`
            );
          })
          .catch(() =>
            message.channel.send(
              `❌ ${message.author}, I couldn't send you a PM. Please enable your PMs and then try the command again!`
            )
          );
      })
      .catch(error => {
        // Error embed
        let errorEmbed = new MessageEmbed()
          .setTitle("Feirm Blockchain Migration")
          .setColor("0xFF0000")
          .setThumbnail("https://feirm.com/img/logo.3bad5560.png")
          .setDescription(
            `${message.author}, it seems we had an issue creating your swap request! Please read the error message below and try again!`
          )
          .addField("Reason", "```\n" + error.response.data.error + "\n```")
          .setFooter(
            "Made with ❤️ by the Feirm developers",
            "https://feirm.com/img/logo.3bad5560.png"
          )
          .setTimestamp();

        message.author
          .send(errorEmbed)
          .then(() => {
            message.channel.send(
              `:white_check_mark: ${message.author}, I've sent you a PM! Please give it a read for further instructions!`
            );
          })
          .catch(() =>
            message.channel.send(
              `❌ ${message.author}, I couldn't send you a PM. Please enable your PMs and then try the command again!`
            )
          );
      });

    await message.delete();
  }
});

client.login(config.token);
