#!/usr/bin/env node

require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { program } = require("commander");
const { Client, GatewayIntentBits, Partials } = require("discord.js");

// Configure CLI
program
  .name("fire-chief")
  .description("CLI to manage Discord firefighter role assignments")
  .version("1.0.0")
  .option("-d, --data <path>", "Path to the JSON data file", "./data.json")
  .option(
    "-t, --test",
    "Run in test mode without making Discord changes",
    false
  )
  .parse(process.argv);

const options = program.opts();

// Initialize Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
  ],
  partials: [Partials.Channel],
});

// Load data from JSON file
function loadData(filePath) {
  try {
    const data = fs.readFileSync(path.resolve(filePath), "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error loading data file: ${error.message}`);
    process.exit(1);
  }
}

// Find the current week's firefighters
function findCurrentFirefighters(data) {
  const today = new Date();

  for (const week of data) {
    const startDate = new Date(week.start);
    const endDate = new Date(week.end);

    if (today >= startDate && today <= endDate) {
      return week.firefighters;
    }
  }

  console.warn("No firefighters found for the current week");
  return null;
}

// Send message to Discord channel
async function sendDiscordMessage(guild, firefighters) {
  try {
    const channelId = process.env.DISCORD_CHANNEL_ID;
    const channel = await guild.channels.fetch(channelId);

    if (!channel) {
      throw new Error(`Channel with ID ${channelId} not found`);
    }

    // First, fetch all user IDs
    const firefightersWithIds = await Promise.all(
      firefighters.map(async (ff) => {
        try {
          const members = await guild.members.fetch({
            query: ff.discord,
            limit: 1,
          });
          const member = members.first();
          return {
            ...ff,
            userId: member ? member.user.id : null,
          };
        } catch (error) {
          console.warn(`Could not fetch user ID for ${ff.discord}`);
          return {
            ...ff,
            userId: null,
          };
        }
      })
    );

    const message = formatFirefighterMessage(firefightersWithIds);
    await channel.send(message);
    console.log("Message sent successfully to Discord channel");
  } catch (error) {
    console.error(`Error sending message: ${error.message}`);
  }
}

// Format the message for Discord
function formatFirefighterMessage(firefighters) {
  const dateRange = getFormattedDateRange();

  let message = `**🔥 Bombeiros da Semana (${dateRange}) 🔥**\n\n`;

  firefighters.forEach((ff) => {
    const mention = ff.userId ? `<@${ff.userId}>` : ff.discord;
    message += `- **${ff.name}** (${ff.team}) - ${mention}\n`;
  });

  message +=
    "\nEstes são os responsáveis por atender aos incidentes desta semana. Boa sorte! 🚒";

  return message;
}

// Get formatted date range for the current week
function getFormattedDateRange() {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Adjust for starting week on Monday

  const monday = new Date(today);
  monday.setDate(today.getDate() - diff);

  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);

  const formatDate = (date) => {
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  return `${formatDate(monday)} a ${formatDate(friday)}`;
}

// Manage Discord roles
async function manageFirefighterRoles(guild, firefighters) {
  try {
    const roleId = process.env.DISCORD_FIREFIGHTER_ROLE_ID;
    const role = await guild.roles.fetch(roleId);

    if (!role) {
      throw new Error(`Role with ID ${roleId} not found`);
    }

    // Get all members with the firefighter role
    const membersWithRole = await guild.members.fetch();
    const currentFirefighters = membersWithRole.filter((member) =>
      member.roles.cache.has(roleId)
    );

    // Remove role from all current firefighters
    for (const [_, member] of currentFirefighters) {
      await member.roles.remove(roleId);
      console.log(`Removed firefighter role from ${member.user.username}`);
    }

    // Add role to new firefighters
    for (const ff of firefighters) {
      try {
        const member = await guild.members.fetch({
          query: ff.discord,
          limit: 1,
        });
        if (member.size > 0) {
          const firstMember = member.first();
          await firstMember.roles.add(roleId);
          console.log(`Added firefighter role to ${firstMember.user.username}`);
        } else {
          console.warn(`Member with Discord username ${ff.discord} not found`);
        }
      } catch (error) {
        console.error(
          `Error managing role for ${ff.discord}: ${error.message}`
        );
      }
    }

    console.log("Role management completed");
  } catch (error) {
    console.error(`Error managing roles: ${error.message}`);
  }
}

// Main function
async function main() {
  console.log("Starting Fire Chief...");

  // Load data
  const data = loadData(options.data);
  const firefighters = findCurrentFirefighters(data);

  if (!firefighters) {
    console.log("No firefighters found for the current week. Exiting.");
    process.exit(0);
  }

  console.log(`Found ${firefighters.length} firefighters for the current week`);

  if (options.test) {
    console.log("Running in test mode. No Discord changes will be made.");
    console.log("Firefighters for this week:", firefighters);
    process.exit(0);
  }

  // Connect to Discord
  client.once("ready", async () => {
    console.log(`Logged in as ${client.user.tag}`);

    try {
      const guildId = process.env.DISCORD_GUILD_ID;
      const guild = await client.guilds.fetch(guildId);

      if (!guild) {
        throw new Error(`Guild with ID ${guildId} not found`);
      }

      // Send message and manage roles
      await sendDiscordMessage(guild, firefighters);
      await manageFirefighterRoles(guild, firefighters);

      console.log("All tasks completed successfully");
    } catch (error) {
      console.error(`Error: ${error.message}`);
    } finally {
      client.destroy();
      process.exit(0);
    }
  });

  // Login to Discord
  client.login(process.env.DISCORD_TOKEN).catch((error) => {
    console.error(`Failed to login to Discord: ${error.message}`);
    process.exit(1);
  });
}

// Run the program
main();
