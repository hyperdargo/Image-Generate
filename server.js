const express = require('express');
const axios = require('axios');
const path = require('path');
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 25580;

// Discord Bot Client with all necessary intents
const discordClient = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

// Store generated images
let generatedImages = [];

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API endpoint for image generation
app.post('/generate-image', async (req, res) => {
    try {
        const { prompt, model = 'flux', width = 512, height = 512 } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        const params = {
            prompt: prompt,
            model: model,
            width: width,
            height: height
        };

        console.log(`Web API: Generating image - ${prompt}`);
        const response = await axios.get('https://imggen-api.ankitgupta.com.np/api/pollination', { 
            params, 
            timeout: 120000 
        });
        
        if (response.data.url) {
            const imageData = {
                prompt: prompt,
                url: response.data.url,
                model: model,
                timestamp: new Date().toISOString(),
                dimensions: `${width}x${height}`
            };
            
            generatedImages.unshift(imageData);
            if (generatedImages.length > 50) {
                generatedImages = generatedImages.slice(0, 50);
            }

            res.json({ success: true, data: imageData });
        } else {
            res.status(500).json({ error: 'Failed to generate image' });
        }
    } catch (error) {
        console.error('Web API Image generation error:', error);
        res.status(500).json({ error: 'Image generation failed. Please try again.' });
    }
});

// Get recent images
app.get('/recent-images', (req, res) => {
    res.json({ images: generatedImages.slice(0, 20) });
});

// Discord bot status
app.get('/bot-status', (req, res) => {
    res.json({ 
        status: discordClient.isReady() ? 'online' : 'offline',
        username: discordClient.user?.tag || 'Not connected',
        guilds: discordClient.guilds?.cache.size || 0
    });
});

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        port: PORT,
        nodeVersion: process.version,
        discordBot: discordClient.isReady() ? 'online' : 'offline'
    });
});

// ========== DISCORD BOT EVENT HANDLERS ==========

// Bot ready event
discordClient.once('ready', () => {
    console.log(`🤖 DTEmpire Bot logged in as ${discordClient.user.tag}`);
    console.log(`📊 Serving ${discordClient.guilds.cache.size} servers`);
    console.log(`🔗 Invite Link: https://discord.com/oauth2/authorize?client_id=${discordClient.user.id}&permissions=2147485696&scope=bot%20applications.commands`);
    
    // Set bot activity
    discordClient.user.setActivity('.imggen | DTEmpire AI');
});

// Debug: Log when bot joins a guild
discordClient.on('guildCreate', (guild) => {
    console.log(`✅ Joined new guild: ${guild.name} (${guild.id}) with ${guild.memberCount} members`);
});

// Debug: Log when bot leaves a guild
discordClient.on('guildDelete', (guild) => {
    console.log(`❌ Left guild: ${guild.name} (${guild.id})`);
});

// Message handler for .imggen command
discordClient.on('messageCreate', async (message) => {
    // Ignore messages from bots
    if (message.author.bot) return;
    
    console.log(`📨 Message received: "${message.content}" from ${message.author.tag} in ${message.guild?.name || 'DM'}`);
    
    // Check for .imggen command
    if (message.content.startsWith('.imggen')) {
        console.log(`🎨 .imggen command detected from ${message.author.tag}`);
        
        const args = message.content.slice(8).trim();
        
        if (!args) {
            console.log('❌ No prompt provided');
            const embed = new EmbedBuilder()
                .setColor(0xFFA500)
                .setTitle('❓ DTEmpire AI - Usage')
                .setDescription('**Command:** `.imggen <prompt>`')
                .addFields(
                    { name: 'Example', value: '`.imggen a beautiful sunset over mountains`', inline: false },
                    { name: 'Available Models', value: 'Flux (default), Turbo, Kontext', inline: false },
                    { name: 'Note', value: 'Keep prompts under 500 characters', inline: false }
                )
                .setFooter({ text: 'Made by DTEmpire • http://dsc.gg/dtempire' });
            
            return message.reply({ embeds: [embed] });
        }

        if (args.length > 500) {
            console.log('❌ Prompt too long');
            const embed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('❌ DTEmpire AI Image Generator')
                .setDescription('Prompt too long! Keep it under 500 characters.')
                .setFooter({ text: 'Made by DTEmpire' });
            return message.reply({ embeds: [embed] });
        }

        try {
            console.log(`🔄 Starting image generation for: "${args}"`);
            
            // Send generating message
            const generatingEmbed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle('🔄 DTEmpire AI Image Generator')
                .setDescription(`Generating image for: \`\`\`${args}\`\`\``)
                .setFooter({ text: 'This may take 30-60 seconds...' });

            const sentMessage = await message.reply({ 
                embeds: [generatingEmbed]
            });

            // Generate image
            const startTime = Date.now();
            console.log(`📡 Calling image API for: "${args}"`);
            
            const response = await axios.get('https://imggen-api.ankitgupta.com.np/api/pollination', {
                params: {
                    prompt: args,
                    model: 'flux',
                    width: 512,
                    height: 512
                },
                timeout: 120000
            });
            
            const generationTime = Date.now() - startTime;
            console.log(`✅ Image generated in ${generationTime}ms: ${response.data.url}`);

            if (response.data && response.data.url) {
                // Create result embed
                const resultEmbed = new EmbedBuilder()
                    .setColor(0x00FF00)
                    .setTitle('🎨 DTEmpire AI Image Generator')
                    .setDescription(`**Prompt:** \`\`\`${args}\`\`\``)
                    .addFields(
                        { name: 'Model', value: 'Flux', inline: true },
                        { name: 'Status', value: 'Completed ✅', inline: true },
                        { name: 'Generation Time', value: `${generationTime}ms`, inline: true }
                    )
                    .setImage(response.data.url)
                    .setFooter({ 
                        text: `Made by DTEmpire • Requested by ${message.author.tag}`,
                        iconURL: message.author.displayAvatarURL()
                    })
                    .setTimestamp();

                // Edit the original message with result
                await sentMessage.edit({ 
                    embeds: [resultEmbed]
                });
                
                console.log(`✅ Successfully sent image to ${message.author.tag}`);
            } else {
                throw new Error('No image URL received from API');
            }

        } catch (error) {
            console.error('❌ Command error:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('❌ DTEmpire AI Image Generator')
                .setDescription(`Failed to generate image: ${error.message}`)
                .setFooter({ text: 'Please try again with a different prompt' });

            try {
                await message.reply({ embeds: [errorEmbed] });
            } catch (replyError) {
                console.error('Failed to send error message:', replyError);
            }
        }
    }
});

// Error handling
discordClient.on('error', (error) => {
    console.error('❌ Discord client error:', error);
});

discordClient.on('warn', (warning) => {
    console.warn('⚠️ Discord client warning:', warning);
});

process.on('unhandledRejection', (error) => {
    console.error('❌ Unhandled promise rejection:', error);
});

// Start server and bot
async function startServer() {
    try {
        console.log('🚀 Starting DTEmpire AI Server...');
        
        // Start Discord bot
        console.log('🔐 Logging into Discord...');
        await discordClient.login(process.env.DISCORD_BOT_TOKEN);
        
        // Start web server
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🌐 DTEmpire Web server running on http://0.0.0.0:${PORT}`);
            console.log(`📍 Access via: http://panel.ankitgupta.com.np:${PORT}`);
            console.log(`🤖 DTEmpire Discord bot is: ${discordClient.isReady() ? '✅ ONLINE' : '❌ OFFLINE'}`);
            console.log(`⏰ Started at: ${new Date().toLocaleString()}`);
            
            if (discordClient.isReady()) {
                console.log(`📊 Bot is in ${discordClient.guilds.cache.size} servers:`);
                discordClient.guilds.cache.forEach(guild => {
                    console.log(`   - ${guild.name} (${guild.id})`);
                });
            }
        });
    } catch (error) {
        console.error('❌ Failed to start:', error);
        process.exit(1);
    }
}

startServer();
