
const { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes, EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildModeration
    ]
});

const startTime = Date.now();
const afkUsers = new Map();
const NOTIFICATION_CHANNEL_ID = 'CHANNELL ID';

const commands = [
    // Moderation Commands
    new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kick a user from the server')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to kick')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the kick')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

    new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Ban a user from the server')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to ban')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the ban')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

    new SlashCommandBuilder()
        .setName('unban')
        .setDescription('Unban a user from the server')
        .addStringOption(option =>
            option.setName('userid')
                .setDescription('The user ID to unban')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

    new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('Timeout a user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to timeout')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('duration')
                .setDescription('Duration in minutes')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(40320))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the timeout')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    new SlashCommandBuilder()
        .setName('untimeout')
        .setDescription('Remove timeout from a user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to remove timeout from')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Clear messages from a channel')
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Number of messages to delete (1-100)')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Warn a user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to warn')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the warning')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Get information about a user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to get info about')
                .setRequired(false)),

    new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('Get information about the server'),

    new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Get a user\'s avatar')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to get avatar from')
                .setRequired(false)),

    new SlashCommandBuilder()
        .setName('lockdown')
        .setDescription('Lock down the current channel')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

    new SlashCommandBuilder()
        .setName('unlock')
        .setDescription('Unlock the current channel')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

    new SlashCommandBuilder()
        .setName('help')
        .setDescription('Show all available commands'),

    new SlashCommandBuilder()
        .setName('afk')
        .setDescription('Set yourself as AFK')
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for going AFK')
                .setRequired(false)),

    new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Check bot latency'),

    new SlashCommandBuilder()
        .setName('uptime')
        .setDescription('Check bot uptime'),

    new SlashCommandBuilder()
        .setName('stats')
        .setDescription('Show bot statistics'),

    new SlashCommandBuilder()
        .setName('invite')
        .setDescription('Get bot invite link'),

    new SlashCommandBuilder()
        .setName('listroles')
        .setDescription('List all roles in the server'),

    new SlashCommandBuilder()
        .setName('updatechannel')
        .setDescription('Send update message to channels in all servers (Bot owner only)')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('Message to send')
                .setRequired(true)),

    new SlashCommandBuilder()
        .setName('bypass')
        .setDescription('Bypass a URL using the API')
        .addStringOption(option =>
            option.setName('url')
                .setDescription('The URL to bypass')
                .setRequired(true)),

    new SlashCommandBuilder()
        .setName('search-scripts')
        .setDescription('Search scripts from ScriptBlox API')
        .addStringOption(option =>
            option.setName('query')
                .setDescription('Search query for scripts')
                .setRequired(true))
];

client.once('ready', async () => {
    console.log(`${client.user.tag} is online!`);
    
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN);
    
    try {
        console.log('Started refreshing application (/) commands.');
        
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands },
        );
        
        console.log('Successfully reloaded application (/) commands.');
        
        // Send online notification
        const channel = client.channels.cache.get(NOTIFICATION_CHANNEL_ID);
        if (channel) {
            const embed = new EmbedBuilder()
                .setColor('#4ECDC4')
                .setTitle('🟢 Bot Online')
                .setDescription(`${client.user.tag} is now online and ready!`)
                .addFields(
                    { name: 'Servers', value: client.guilds.cache.size.toString(), inline: true },
                    { name: 'Users', value: client.users.cache.size.toString(), inline: true }
                )
                .setTimestamp();

            await channel.send({ embeds: [embed] });
        }
    } catch (error) {
        console.error(error);
    }
});

client.on('interactionCreate', async interaction => {
    if (interaction.isButton()) {
        if (interaction.customId.startsWith('script_')) {
            const [action, direction, query, page] = interaction.customId.split('_');
            const pageNum = parseInt(page);
            
            await interaction.deferUpdate();
            await fetchAndDisplayScripts(interaction, query, pageNum);
        }
        return;
    }
    
    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;

    try {
        switch (commandName) {
            case 'kick':
                await handleKick(interaction);
                break;
            case 'ban':
                await handleBan(interaction);
                break;
            case 'unban':
                await handleUnban(interaction);
                break;
            case 'timeout':
                await handleTimeout(interaction);
                break;
            case 'untimeout':
                await handleUntimeout(interaction);
                break;
            case 'clear':
                await handleClear(interaction);
                break;
            case 'warn':
                await handleWarn(interaction);
                break;
            case 'userinfo':
                await handleUserInfo(interaction);
                break;
            case 'serverinfo':
                await handleServerInfo(interaction);
                break;
            case 'avatar':
                await handleAvatar(interaction);
                break;
            case 'lockdown':
                await handleLockdown(interaction);
                break;
            case 'unlock':
                await handleUnlock(interaction);
                break;
            case 'help':
                await handleHelp(interaction);
                break;
            case 'afk':
                await handleAfk(interaction);
                break;
            case 'ping':
                await handlePing(interaction);
                break;
            case 'uptime':
                await handleUptime(interaction);
                break;
            case 'stats':
                await handleStats(interaction);
                break;
            case 'invite':
                await handleInvite(interaction);
                break;
            case 'listroles':
                await handleListRoles(interaction);
                break;
            case 'updatechannel':
                await handleUpdateChannel(interaction);
                break;
            case 'bypass':
                await handleBypass(interaction);
                break;
            case 'search-scripts':
                await handleSearchScripts(interaction);
                break;
        }
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error executing this command!', ephemeral: true });
    }
});

async function handleKick(interaction) {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const member = interaction.guild.members.cache.get(user.id);

    if (!member) {
        return interaction.reply({ content: 'User not found in this server!', ephemeral: true });
    }

    if (!member.kickable) {
        return interaction.reply({ content: 'I cannot kick this user!', ephemeral: true });
    }

    await member.kick(reason);
    
    const embed = new EmbedBuilder()
        .setColor('#FF6B6B')
        .setTitle('User Kicked')
        .addFields(
            { name: 'User', value: `${user.tag}`, inline: true },
            { name: 'Moderator', value: `${interaction.user.tag}`, inline: true },
            { name: 'Reason', value: reason, inline: false }
        )
        .setTimestamp();

    await interaction.reply({ embeds: [embed] });
}

async function handleBan(interaction) {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const member = interaction.guild.members.cache.get(user.id);

    if (member && !member.bannable) {
        return interaction.reply({ content: 'I cannot ban this user!', ephemeral: true });
    }

    await interaction.guild.bans.create(user.id, { reason });
    
    const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('User Banned')
        .addFields(
            { name: 'User', value: `${user.tag}`, inline: true },
            { name: 'Moderator', value: `${interaction.user.tag}`, inline: true },
            { name: 'Reason', value: reason, inline: false }
        )
        .setTimestamp();

    await interaction.reply({ embeds: [embed] });
}

async function handleUnban(interaction) {
    const userId = interaction.options.getString('userid');

    try {
        await interaction.guild.bans.remove(userId);
        
        const embed = new EmbedBuilder()
            .setColor('#4ECDC4')
            .setTitle('User Unbanned')
            .addFields(
                { name: 'User ID', value: userId, inline: true },
                { name: 'Moderator', value: `${interaction.user.tag}`, inline: true }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    } catch (error) {
        await interaction.reply({ content: 'User not found or not banned!', ephemeral: true });
    }
}

async function handleTimeout(interaction) {
    const user = interaction.options.getUser('user');
    const duration = interaction.options.getInteger('duration');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const member = interaction.guild.members.cache.get(user.id);

    if (!member) {
        return interaction.reply({ content: 'User not found in this server!', ephemeral: true });
    }

    if (!member.moderatable) {
        return interaction.reply({ content: 'I cannot timeout this user!', ephemeral: true });
    }

    await member.timeout(duration * 60 * 1000, reason);
    
    const embed = new EmbedBuilder()
        .setColor('#FFA726')
        .setTitle('User Timed Out')
        .addFields(
            { name: 'User', value: `${user.tag}`, inline: true },
            { name: 'Duration', value: `${duration} minutes`, inline: true },
            { name: 'Moderator', value: `${interaction.user.tag}`, inline: true },
            { name: 'Reason', value: reason, inline: false }
        )
        .setTimestamp();

    await interaction.reply({ embeds: [embed] });
}

async function handleUntimeout(interaction) {
    const user = interaction.options.getUser('user');
    const member = interaction.guild.members.cache.get(user.id);

    if (!member) {
        return interaction.reply({ content: 'User not found in this server!', ephemeral: true });
    }

    await member.timeout(null);
    
    const embed = new EmbedBuilder()
        .setColor('#4ECDC4')
        .setTitle('Timeout Removed')
        .addFields(
            { name: 'User', value: `${user.tag}`, inline: true },
            { name: 'Moderator', value: `${interaction.user.tag}`, inline: true }
        )
        .setTimestamp();

    await interaction.reply({ embeds: [embed] });
}

async function handleClear(interaction) {
    const amount = interaction.options.getInteger('amount');

    const messages = await interaction.channel.messages.fetch({ limit: amount });
    await interaction.channel.bulkDelete(messages);

    const embed = new EmbedBuilder()
        .setColor('#4ECDC4')
        .setTitle('Messages Cleared')
        .addFields(
            { name: 'Amount', value: `${amount} messages`, inline: true },
            { name: 'Moderator', value: `${interaction.user.tag}`, inline: true }
        )
        .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
}

async function handleWarn(interaction) {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason');

    const embed = new EmbedBuilder()
        .setColor('#FFEB3B')
        .setTitle('User Warned')
        .addFields(
            { name: 'User', value: `${user.tag}`, inline: true },
            { name: 'Moderator', value: `${interaction.user.tag}`, inline: true },
            { name: 'Reason', value: reason, inline: false }
        )
        .setTimestamp();

    await interaction.reply({ embeds: [embed] });

    // Try to DM the user
    try {
        const dmEmbed = new EmbedBuilder()
            .setColor('#FFEB3B')
            .setTitle('You have been warned')
            .addFields(
                { name: 'Server', value: interaction.guild.name, inline: true },
                { name: 'Moderator', value: interaction.user.tag, inline: true },
                { name: 'Reason', value: reason, inline: false }
            )
            .setTimestamp();

        await user.send({ embeds: [dmEmbed] });
    } catch (error) {
        console.log('Could not DM user');
    }
}

async function handleUserInfo(interaction) {
    const user = interaction.options.getUser('user') || interaction.user;
    const member = interaction.guild.members.cache.get(user.id);

    const embed = new EmbedBuilder()
        .setColor('#4ECDC4')
        .setTitle('User Information')
        .setThumbnail(user.displayAvatarURL())
        .addFields(
            { name: 'Username', value: user.tag, inline: true },
            { name: 'ID', value: user.id, inline: true },
            { name: 'Account Created', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`, inline: false }
        );

    if (member) {
        embed.addFields(
            { name: 'Joined Server', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`, inline: false },
            { name: 'Roles', value: member.roles.cache.map(role => role.toString()).join(' ') || 'None', inline: false }
        );
    }

    await interaction.reply({ embeds: [embed] });
}

async function handleServerInfo(interaction) {
    const guild = interaction.guild;

    const embed = new EmbedBuilder()
        .setColor('#4ECDC4')
        .setTitle('Server Information')
        .setThumbnail(guild.iconURL())
        .addFields(
            { name: 'Server Name', value: guild.name, inline: true },
            { name: 'Server ID', value: guild.id, inline: true },
            { name: 'Owner', value: `<@${guild.ownerId}>`, inline: true },
            { name: 'Members', value: guild.memberCount.toString(), inline: true },
            { name: 'Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`, inline: false }
        )
        .setTimestamp();

    await interaction.reply({ embeds: [embed] });
}

async function handleAvatar(interaction) {
    const user = interaction.options.getUser('user') || interaction.user;

    const embed = new EmbedBuilder()
        .setColor('#4ECDC4')
        .setTitle(`${user.tag}'s Avatar`)
        .setImage(user.displayAvatarURL({ size: 512 }));

    await interaction.reply({ embeds: [embed] });
}

async function handleLockdown(interaction) {
    const channel = interaction.channel;

    await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
        SendMessages: false
    });

    const embed = new EmbedBuilder()
        .setColor('#FF6B6B')
        .setTitle('Channel Locked')
        .setDescription(`${channel} has been locked down by ${interaction.user}`)
        .setTimestamp();

    await interaction.reply({ embeds: [embed] });
}

async function handleUnlock(interaction) {
    const channel = interaction.channel;

    await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
        SendMessages: null
    });

    const embed = new EmbedBuilder()
        .setColor('#4ECDC4')
        .setTitle('Channel Unlocked')
        .setDescription(`${channel} has been unlocked by ${interaction.user}`)
        .setTimestamp();

    await interaction.reply({ embeds: [embed] });
}

async function handleHelp(interaction) {
    const embed = new EmbedBuilder()
        .setColor('#4ECDC4')
        .setTitle('Available Commands')
        .setDescription('Here are all the commands you can use:')
        .addFields(
            { name: '🔨 Moderation', value: '`/kick` `/ban` `/unban` `/timeout` `/untimeout` `/warn` `/clear` `/lockdown` `/unlock`', inline: false },
            { name: '📊 Information', value: '`/userinfo` `/serverinfo` `/avatar` `/stats` `/uptime` `/ping`', inline: false },
            { name: '🎭 Utility', value: '`/afk` `/listroles` `/invite` `/help` `/bypass` `/search-scripts`', inline: false },
            { name: '⚙️ Admin', value: '`/updatechannel` (Bot owner only)', inline: false }
        )
        .setTimestamp();

    await interaction.reply({ embeds: [embed] });
}

async function handleAfk(interaction) {
    const reason = interaction.options.getString('reason') || 'No reason provided';
    
    afkUsers.set(interaction.user.id, {
        reason: reason,
        timestamp: Date.now()
    });

    const embed = new EmbedBuilder()
        .setColor('#FFEB3B')
        .setTitle('AFK Status Set')
        .setDescription(`${interaction.user} is now AFK: ${reason}`)
        .setTimestamp();

    await interaction.reply({ embeds: [embed] });
}

async function handlePing(interaction) {
    const ping = client.ws.ping;
    
    const embed = new EmbedBuilder()
        .setColor('#4ECDC4')
        .setTitle('🏓 Pong!')
        .addFields(
            { name: 'Websocket Latency', value: `${ping}ms`, inline: true },
            { name: 'API Latency', value: `${Date.now() - interaction.createdTimestamp}ms`, inline: true }
        )
        .setTimestamp();

    await interaction.reply({ embeds: [embed] });
}

async function handleUptime(interaction) {
    const uptime = Date.now() - startTime;
    const days = Math.floor(uptime / (1000 * 60 * 60 * 24));
    const hours = Math.floor((uptime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((uptime % (1000 * 60)) / 1000);

    const embed = new EmbedBuilder()
        .setColor('#4ECDC4')
        .setTitle('⏰ Bot Uptime')
        .setDescription(`${days}d ${hours}h ${minutes}m ${seconds}s`)
        .setTimestamp();

    await interaction.reply({ embeds: [embed] });
}

async function handleStats(interaction) {
    const embed = new EmbedBuilder()
        .setColor('#4ECDC4')
        .setTitle('📊 Bot Statistics')
        .addFields(
            { name: 'Servers', value: client.guilds.cache.size.toString(), inline: true },
            { name: 'Users', value: client.users.cache.size.toString(), inline: true },
            { name: 'Channels', value: client.channels.cache.size.toString(), inline: true },
            { name: 'Ping', value: `${client.ws.ping}ms`, inline: true },
            { name: 'Memory Usage', value: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`, inline: true },
            { name: 'Node.js Version', value: process.version, inline: true }
        )
        .setTimestamp();

    await interaction.reply({ embeds: [embed] });
}

async function handleInvite(interaction) {
    const inviteLink = `https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands`;
    
    const embed = new EmbedBuilder()
        .setColor('#4ECDC4')
        .setTitle('🔗 Invite Bot')
        .setDescription(`[Click here to invite me to your server!](${inviteLink})`)
        .addFields(
            { name: 'Permissions', value: 'Administrator (for full functionality)', inline: false }
        )
        .setTimestamp();

    await interaction.reply({ embeds: [embed] });
}

async function handleListRoles(interaction) {
    const roles = interaction.guild.roles.cache
        .filter(role => role.name !== '@everyone')
        .sort((a, b) => b.position - a.position)
        .map(role => `${role} - ${role.members.size} members`)
        .slice(0, 25); // Discord embed field limit

    const embed = new EmbedBuilder()
        .setColor('#4ECDC4')
        .setTitle('📋 Server Roles')
        .setDescription(roles.join('\n') || 'No roles found')
        .addFields(
            { name: 'Total Roles', value: (interaction.guild.roles.cache.size - 1).toString(), inline: true }
        )
        .setTimestamp();

    await interaction.reply({ embeds: [embed] });
}

async function handleUpdateChannel(interaction) {
    // Replace 'YOUR_USER_ID' with your actual Discord user ID
    const botOwnerId = 'YOUR_USER_ID'; // You need to set this to your Discord user ID
    
    if (interaction.user.id !== botOwnerId) {
        return interaction.reply({ content: 'Only the bot owner can use this command!', ephemeral: true });
    }

    const message = interaction.options.getString('message');
    let successCount = 0;
    let totalGuilds = client.guilds.cache.size;

    await interaction.deferReply({ ephemeral: true });

    for (const guild of client.guilds.cache.values()) {
        try {
            const channel = guild.systemChannel || guild.channels.cache.find(ch => ch.type === 0 && ch.permissionsFor(guild.members.me).has('SendMessages'));
            
            if (channel) {
                const embed = new EmbedBuilder()
                    .setColor('#4ECDC4')
                    .setTitle('📢 Bot Update')
                    .setDescription(message)
                    .setTimestamp();

                await channel.send({ embeds: [embed] });
                successCount++;
            }
        } catch (error) {
            console.log(`Failed to send update to ${guild.name}: ${error.message}`);
        }
    }

    await interaction.editReply({ content: `Update sent to ${successCount}/${totalGuilds} servers.` });
}

async function handleBypass(interaction) {
    const url = interaction.options.getString('url');
    
    // Show initial processing message
    const processingEmbed = new EmbedBuilder()
        .setColor('#FFA726')
        .setTitle('🔄 Processando')
        .setDescription('Processando seu link...')
        .addFields(
            { name: 'URL', value: `\`${url}\``, inline: false }
        )
        .setTimestamp();

    await interaction.reply({ embeds: [processingEmbed] });

    try {
        const apiUrl = `YOU API URL=${encodeURIComponent(url)}`;
        
        const response = await fetch(apiUrl);
        const data = await response.json();

        let embed;
        
        if (response.ok && data) {
            embed = new EmbedBuilder()
                .setColor('#4ECDC4')
                .setTitle('🔑 Bypass Result');

            // Add result fields based on the API response
            if (data.result) {
                embed.addFields({ name: '🔑 Result', value: `\`\`\`lua\n${data.result}\n\`\`\``, inline: false });
            }
            
            if (data.bypassed_url) {
                embed.addFields({ name: 'Bypassed URL', value: `[Click here](${data.bypassed_url})`, inline: false });
            }
            
            if (data.message) {
                embed.addFields({ name: 'Message', value: data.message, inline: false });
            }

            if (data.time_taken) {
                embed.addFields({ name: '🕒 Time Taken', value: `${data.time_taken}`, inline: true });
            }

            // Add any other fields from the response except name and status
            Object.keys(data).forEach(key => {
                if (!['result', 'bypassed_url', 'message', 'time_taken', 'name', 'status'].includes(key) && typeof data[key] === 'string') {
                    embed.addFields({ name: key.charAt(0).toUpperCase() + key.slice(1), value: data[key], inline: true });
                }
            });

        } else {
            embed = new EmbedBuilder()
                .setColor('#FF6B6B')
                .setTitle('❌ Bypass Failed')
                .addFields(
                    { name: 'Error', value: data.error || 'Unknown error occurred', inline: false }
                );
        }

        embed.setTimestamp();
        await interaction.editReply({ embeds: [embed] });

    } catch (error) {
        console.error('Bypass API Error:', error);
        
        const errorEmbed = new EmbedBuilder()
            .setColor('#FF6B6B')
            .setTitle('❌ API Error')
            .addFields(
                { name: 'Error', value: 'Failed to connect to bypass API', inline: false }
            )
            .setTimestamp();

        await interaction.editReply({ embeds: [errorEmbed] });
    }
}

async function handleSearchScripts(interaction) {
    const query = interaction.options.getString('query');
    
    // Show initial processing message
    const processingEmbed = new EmbedBuilder()
        .setColor('#FFA726')
        .setTitle('🔍 Searching Scripts')
        .setDescription('Searching for scripts...')
        .addFields(
            { name: 'Query', value: `\`${query}\``, inline: false }
        )
        .setTimestamp();

    await interaction.reply({ embeds: [processingEmbed] });

    try {
        await fetchAndDisplayScripts(interaction, query, 1);
    } catch (error) {
        console.error('Search Scripts Error:', error);
        
        const errorEmbed = new EmbedBuilder()
            .setColor('#FF6B6B')
            .setTitle('❌ Search Error')
            .addFields(
                { name: 'Error', value: 'Failed to search scripts', inline: false }
            )
            .setTimestamp();

        await interaction.editReply({ embeds: [errorEmbed] });
    }
}

async function fetchAndDisplayScripts(interaction, query, page = 1) {
    try {
        const apiUrl = `https://scriptblox.com/api/script/search?q=${encodeURIComponent(query)}&page=${page}`;
        
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (response.ok && data && data.result && data.result.scripts) {
            const scripts = data.result.scripts;
            const totalPages = Math.ceil(data.result.totalPages || 1);
            
            let embed = new EmbedBuilder()
                .setColor('#4ECDC4')
                .setTitle('📜 Script Search Results')
                .setDescription(`Found scripts for: **${query}**`)
                .addFields(
                    { name: 'Page', value: `${page}/${totalPages}`, inline: true },
                    { name: 'Total Scripts', value: data.result.totalScripts?.toString() || 'Unknown', inline: true }
                )
                .setTimestamp();

            // Add script results (max 10 per page)
            scripts.slice(0, 10).forEach((script, index) => {
                const title = script.title || 'Untitled Script';
                const game = script.game?.name || 'Unknown Game';
                const views = script.views || 0;
                const verified = script.verified ? '✅' : '❌';
                const scriptUrl = `https://scriptblox.com/script/${script.slug || script._id}`;
                
                embed.addFields({
                    name: `${index + 1}. ${title}`,
                    value: `**Game:** ${game}\n**Views:** ${views}\n**Verified:** ${verified}\n**Link:** [View Script](${scriptUrl})`,
                    inline: false
                });
            });

            // Create navigation buttons
            const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
            
            const row = new ActionRowBuilder();
            
            if (page > 1) {
                row.addComponents(
                    new ButtonBuilder()
                        .setCustomId(`script_prev_${query}_${page - 1}`)
                        .setLabel('◀ Previous')
                        .setStyle(ButtonStyle.Secondary)
                );
            }
            
            if (page < totalPages) {
                row.addComponents(
                    new ButtonBuilder()
                        .setCustomId(`script_next_${query}_${page + 1}`)
                        .setLabel('Next ▶')
                        .setStyle(ButtonStyle.Primary)
                );
            }

            const messageData = { embeds: [embed] };
            if (row.components.length > 0) {
                messageData.components = [row];
            }

            await interaction.editReply(messageData);

        } else {
            const embed = new EmbedBuilder()
                .setColor('#FF6B6B')
                .setTitle('❌ No Scripts Found')
                .addFields(
                    { name: 'Query', value: query, inline: false },
                    { name: 'Message', value: 'No scripts found for this search query', inline: false }
                )
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        }

    } catch (error) {
        console.error('Fetch Scripts Error:', error);
        
        const errorEmbed = new EmbedBuilder()
            .setColor('#FF6B6B')
            .setTitle('❌ API Error')
            .addFields(
                { name: 'Error', value: 'Failed to connect to ScriptBlox API', inline: false }
            )
            .setTimestamp();

        await interaction.editReply({ embeds: [errorEmbed] });
    }
}

// Handle bot going offline
process.on('SIGINT', async () => {
    try {
        const channel = client.channels.cache.get(NOTIFICATION_CHANNEL_ID);
        if (channel) {
            const embed = new EmbedBuilder()
                .setColor('#FF6B6B')
                .setTitle('🔴 Bot Offline')
                .setDescription(`${client.user.tag} is going offline...`)
                .setTimestamp();

            await channel.send({ embeds: [embed] });
        }
    } catch (error) {
        console.log('Error sending offline notification:', error);
    }
    
    client.destroy();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    try {
        const channel = client.channels.cache.get(NOTIFICATION_CHANNEL_ID);
        if (channel) {
            const embed = new EmbedBuilder()
                .setColor('#FF6B6B')
                .setTitle('🔴 Bot Offline')
                .setDescription(`${client.user.tag} is going offline...`)
                .setTimestamp();

            await channel.send({ embeds: [embed] });
        }
    } catch (error) {
        console.log('Error sending offline notification:', error);
    }
    
    client.destroy();
    process.exit(0);
});

// AFK system - check for mentions
client.on('messageCreate', async message => {
    if (message.author.bot) return;

    // Check if the message author is AFK and remove them from AFK
    if (afkUsers.has(message.author.id)) {
        afkUsers.delete(message.author.id);
        
        const embed = new EmbedBuilder()
            .setColor('#4ECDC4')
            .setDescription(`Welcome back ${message.author}! I've removed your AFK status.`)
            .setTimestamp();

        message.reply({ embeds: [embed] }).then(msg => {
            setTimeout(() => msg.delete().catch(() => {}), 5000);
        });
    }

    // Check for mentions of AFK users
    message.mentions.users.forEach(user => {
        if (afkUsers.has(user.id)) {
            const afkData = afkUsers.get(user.id);
            const afkTime = Math.floor((Date.now() - afkData.timestamp) / 1000);
            
            const embed = new EmbedBuilder()
                .setColor('#FFEB3B')
                .setDescription(`${user} is currently AFK: ${afkData.reason}\n*AFK since <t:${Math.floor(afkData.timestamp / 1000)}:R>*`)
                .setTimestamp();

            message.reply({ embeds: [embed] }).then(msg => {
                setTimeout(() => msg.delete().catch(() => {}), 10000);
            });
        }
    });
});

if (!process.env.DISCORD_BOT_TOKEN) {
    console.error('Please set your DISCORD_BOT_TOKEN in the Secrets tab');
    process.exit(1);
}

// Server join notification
client.on('guildCreate', async guild => {
    try {
        const channel = client.channels.cache.get(NOTIFICATION_CHANNEL_ID);
        if (channel) {
            const embed = new EmbedBuilder()
                .setColor('#4ECDC4')
                .setTitle('🎉 Joined New Server!')
                .addFields(
                    { name: 'Server Name', value: guild.name, inline: true },
                    { name: 'Server ID', value: guild.id, inline: true },
                    { name: 'Members', value: guild.memberCount.toString(), inline: true },
                    { name: 'Owner', value: `<@${guild.ownerId}>`, inline: true }
                )
                .setThumbnail(guild.iconURL())
                .setTimestamp();

            await channel.send({ embeds: [embed] });
        }
    } catch (error) {
        console.log('Error sending server join notification:', error);
    }
});

// Server leave notification
client.on('guildDelete', async guild => {
    try {
        const channel = client.channels.cache.get(NOTIFICATION_CHANNEL_ID);
        if (channel) {
            const embed = new EmbedBuilder()
                .setColor('#FF6B6B')
                .setTitle('😢 Left Server')
                .addFields(
                    { name: 'Server Name', value: guild.name, inline: true },
                    { name: 'Server ID', value: guild.id, inline: true },
                    { name: 'Members', value: guild.memberCount.toString(), inline: true }
                )
                .setThumbnail(guild.iconURL())
                .setTimestamp();

            await channel.send({ embeds: [embed] });
        }
    } catch (error) {
        console.log('Error sending server leave notification:', error);
    }
});

client.login(process.env.DISCORD_BOT_TOKEN);
