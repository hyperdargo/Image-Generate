const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const axios = require('axios');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Store generating messages to edit them later
const generatingMessages = new Map();

// Image generation function
async function generateImage(prompt, model = 'flux', width = 512, height = 512) {
    try {
        const params = {
            prompt: prompt,
            model: model,
            width: width,
            height: height
        };

        console.log(`Generating image with prompt: ${prompt}`);
        const response = await axios.get('https://imggen-api.ankitgupta.com.np/api/pollination', { 
            params, 
            timeout: 120000 
        });
        
        return response.data;
    } catch (error) {
        console.error('Image generation error:', error);
        throw new Error('Failed to generate image: ' + error.message);
    }
}

// Create generating embed
function createGeneratingEmbed(prompt, model, user) {
    return new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle('🔄 DTEmpire AI Image Generator')
        .addFields(
            { name: 'Prompt', value: `\`\`\`${prompt}\`\`\``, inline: false },
            { name: 'Model', value: model, inline: true },
            { name: 'Status', value: 'Generating...', inline: true }
        )
        .setFooter({ 
            text: `Made by DTEmpire • Requested by ${user.tag}`, 
            iconURL: user.displayAvatarURL() 
        })
        .setTimestamp();
}

// Create result embed
function createResultEmbed(prompt, model, imageUrl, user, generationTime) {
    return new EmbedBuilder()
        .setColor(0x00FF00)
        .setTitle('🎨 DTEmpire AI Image Generator')
        .setDescription(`**Prompt:** \`\`\`${prompt}\`\`\``)
        .addFields(
            { name: 'Model', value: model, inline: true },
            { name: 'Status', value: 'Completed ✅', inline: true },
            { name: 'Generation Time', value: `${generationTime}ms`, inline: true }
        )
        .setImage(imageUrl)
        .setFooter({ 
            text: `Made by DTEmpire • Requested by ${user.tag}`, 
            iconURL: user.displayAvatarURL() 
        })
        .setTimestamp();
}

// Create error embed
function createErrorEmbed(prompt, model, error, user) {
    return new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle('❌ DTEmpire AI Image Generator')
        .addFields(
            { name: 'Prompt', value: `\`\`\`${prompt}\`\`\``, inline: false },
            { name: 'Model', value: model, inline: true },
            { name: 'Status', value: 'Failed ❌', inline: true }
        )
        .setDescription(`**Error:** ${error}`)
        .setFooter({ 
            text: `Made by DTEmpire • Requested by ${user.tag}`, 
            iconURL: user.displayAvatarURL() 
        })
        .setTimestamp();
}

// Create action buttons
function createActionButtons(imageUrl) {
    return new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setLabel('Download Image')
                .setStyle(ButtonStyle.Link)
                .setURL(imageUrl),
            new ButtonBuilder()
                .setLabel('Join DTEmpire')
                .setStyle(ButtonStyle.Link)
                .setURL('http://dsc.gg/dtempire-server'),
            new ButtonBuilder()
                .setLabel('Add Bot')
                .setStyle(ButtonStyle.Link)
                .setURL('http://dsc.gg/dtempire')
        );
}

// Bot ready event
client.once('ready', () => {
    console.log(`🤖 DTEmpire Bot logged in as ${client.user.tag}`);
    console.log(`📊 Serving ${client.guilds.cache.size} servers`);
    client.user.setActivity('.imggen | DTEmpire AI');
});

// Message handler for .imggen command
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    
    if (message.content.startsWith('.imggen')) {
        const args = message.content.slice(8).trim();
        
        if (!args) {
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
            const embed = createErrorEmbed(
                args, 
                'Flux', 
                'Prompt too long! Keep it under 500 characters.', 
                message.author
            );
            return message.reply({ embeds: [embed] });
        }

        try {
            // Send generating message
            const generatingEmbed = createGeneratingEmbed(args, 'Flux', message.author);
            const sentMessage = await message.reply({ 
                embeds: [generatingEmbed],
                components: []
            });

            // Store message for later editing
            generatingMessages.set(sentMessage.id, {
                originalMessage: message,
                prompt: args,
                startTime: Date.now()
            });

            // Generate image
            const startTime = Date.now();
            const result = await generateImage(args);
            const generationTime = Date.now() - startTime;

            if (result && result.url) {
                // Create result embed
                const resultEmbed = createResultEmbed(args, 'Flux', result.url, message.author, generationTime);
                const actionButtons = createActionButtons(result.url);
                
                // Edit the original message with result
                await sentMessage.edit({ 
                    embeds: [resultEmbed],
                    components: [actionButtons]
                });
            } else {
                throw new Error('No image URL received from API');
            }

        } catch (error) {
            console.error('Command error:', error);
            
            // Try to edit the original generating message with error
            try {
                const errorEmbed = createErrorEmbed(args, 'Flux', error.message, message.author);
                const sentMessage = [...generatingMessages.values()]
                    .find(msg => msg.originalMessage.id === message.id)?.sentMessage;
                
                if (sentMessage) {
                    await sentMessage.edit({ 
                        embeds: [errorEmbed],
                        components: []
                    });
                } else {
                    await message.reply({ embeds: [errorEmbed] });
                }
            } catch (editError) {
                // If editing fails, send new error message
                const errorEmbed = createErrorEmbed(args, 'Flux', error.message, message.author);
                await message.reply({ embeds: [errorEmbed] });
            }
        }
    }

    // Help command
    if (message.content.startsWith('.help')) {
        const helpEmbed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('🖼️ DTEmpire AI - Help')
            .setDescription('Generate amazing AI images with DTEmpire AI Generator!')
            .addFields(
                {
                    name: '🎨 Generate Image',
                    value: '`.imggen [prompt]`\nExample: `.imggen a beautiful sunset over mountains`'
                },
                {
                    name: '⚙️ Parameters',
                    value: 'Currently supports text prompts only. Keep prompts under 500 characters.'
                },
                {
                    name: '🌐 Web Panel',
                    value: `Visit our web interface: http://panel.ankitgupta.com.np:${process.env.PORT || 25580}`
                },
                {
                    name: '📊 Models',
                    value: '**Flux**: Balanced quality\n**Turbo**: Fast generation\n**Kontext**: Experimental'
                },
                {
                    name: '🔗 Links',
                    value: '[Add Bot](http://dsc.gg/dtempire) • [Join Server](http://dsc.gg/dtempire-server)'
                }
            )
            .setFooter({ text: 'Made by DTEmpire • http://dsc.gg/dtempire' })
            .setTimestamp();

        message.reply({ embeds: [helpEmbed] });
    }
});

// Handle button interactions
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'generate_another') {
        await interaction.reply({
            content: 'Use `.imggen <your prompt>` to generate another image!',
            ephemeral: true
        });
    }
});

// Error handling
client.on('error', (error) => {
    console.error('Discord client error:', error);
});

process.on('unhandledRejection', (error) => {
    console.error('Unhandled promise rejection:', error);
});

// Login to Discord
client.login(process.env.DISCORD_BOT_TOKEN).catch(error => {
    console.error('Failed to login:', error);
    process.exit(1);
});
