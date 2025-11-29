# DTEmpire AI Image Generator

A powerful Discord bot and web application that generates AI images using natural language prompts. Built with Node.js, Express, and Discord.js.
- 🌐 **Website**: [Live Hosted](https://imggen.ankitgupta.com.np/)


![DTEmpire AI](https://img.shields.io/badge/DTEmpire-AI%20Image%20Generator-blue)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![Discord.js](https://img.shields.io/badge/Discord.js-14-blue)

## 🌟 Features

- **🤖 Discord Bot**: Generate images directly in Discord with `.imggen` command
- **🌐 Web Interface**: Beautiful web dashboard for image generation
- **⚡ Multiple AI Models**: Support for Flux, Turbo, and Kontext models
- **🎨 Real-time Generation**: Watch as images are generated in real-time
- **📱 Responsive Design**: Works perfectly on desktop and mobile devices
- **💾 Recent Images**: Gallery of recently generated images
- **🔗 Discord Integration**: Seamless integration with Discord embeds and buttons

## 🚀 Quick Start

### Prerequisites

- Node.js 18 or higher
- Discord Bot Token
- Discord Application ID

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/dtempire-ai.git
   cd dtempire-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file:
   ```env
   # Discord Bot Configuration
   DISCORD_BOT_TOKEN=your_discord_bot_token_here
   CLIENT_ID=your_bot_client_id_here

   # Optional: Server Specific Settings
   GUILD_ID=your_server_id_here
   OWNER_ID=your_user_id_here

   # Web Server Configuration
   PORT=25580

   # API Settings
   IMAGE_API_URL=https://jmlite-tts-api.onrender.com/pollination
   MAX_PROMPT_LENGTH=500
   DEFAULT_MODEL=flux
   NODE_ENV=production
   ```

4. **Start the application**
   ```bash
   npm start
   ```

## 🎯 Usage

### Discord Commands

- **`.imggen <prompt>`** - Generate an image from text prompt
  ```
  .imggen a beautiful sunset over mountains with cherry blossoms
  ```

- **`.help`** - Show help menu with all commands

### Web Interface

Access the web interface at: `http://your-domain.com:25580`

- Enter your prompt in the text area
- Select AI model (Flux, Turbo, or Kontext)
- Adjust image dimensions
- Click "Generate Image"
- View and download generated images

## 🏗️ Project Structure

```
dtempire-ai/
├── server.js              # Main server file (web + Discord bot)
├── package.json           # Dependencies and scripts
├── .env                   # Environment variables
└── public/                # Web interface files
    ├── index.html         # Main web page
    ├── style.css          # Stylesheets
    ├── script.js          # Frontend JavaScript
    └── favicon.ico        # Browser tab icon
```

## 🔧 Technical Details

### Core Technologies

- **Backend**: Node.js, Express.js
- **Discord Integration**: Discord.js v14
- **Frontend**: Vanilla JavaScript, CSS3, HTML5
- **API Integration**: Pollinations AI Image Generation API
- **Real-time Updates**: WebSocket-like polling

### Key Features Implementation

#### Discord Bot
```javascript
// Message handler for .imggen command
client.on('messageCreate', async (message) => {
    if (message.content.startsWith('.imggen')) {
        // Process image generation
        const image = await generateImage(prompt);
        // Send embed with result
    }
});
```

#### Web API
```javascript
app.post('/generate-image', async (req, res) => {
    const { prompt, model, width, height } = req.body;
    const result = await generateImage(prompt, model, width, height);
    res.json({ success: true, data: result });
});
```

#### Real-time Updates
```javascript
// Frontend updates generation status
function showLoading(prompt, model) {
    // Update UI to show generating state
    // Poll for completion
}
```

## 📸 Screenshots

<div align="center">

### Discord Integration
<img src="https://github.com/hyperdargo/Image-Generate/blob/main/images/Screenshot%202025-11-29%20171633.png?raw=true" width="600" alt="Discord Command">

### Web Interface
<img src="https://github.com/hyperdargo/Image-Generate/blob/main/images/Screenshot%202025-11-29%20171731.png?raw=true" width="600" alt="Web Dashboard">

### Mobile Responsive  
<img src="https://github.com/hyperdargo/Image-Generate/blob/main/images/Screenshot_20251129-171929.jpg?raw=true" width="300" alt="Mobile View">

</div>

## 🛠️ Deployment

### Using Pterodactyl

1. Create a new server with Node.js egg
2. Set startup command: `npm install && node server.js`
3. Upload all files to `/home/container/`
4. Configure environment variables in Pterodactyl panel
5. Start the server

### Manual Deployment

1. **Set up reverse proxy** (nginx example):
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:25580;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

2. **Use process manager** (PM2 example):
   ```bash
   npm install -g pm2
   pm2 start server.js --name "dtempire-ai"
   pm2 startup
   pm2 save
   ```

## 🔑 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DISCORD_BOT_TOKEN` | Your Discord bot token | Yes |
| `CLIENT_ID` | Your Discord application ID | Yes |
| `PORT` | Web server port (default: 25580) | No |
| `GUILD_ID` | Specific guild ID for testing | No |
| `OWNER_ID` | Bot owner user ID | No |

## 🤝 Contributing

We welcome contributions! Please feel free to submit pull requests or open issues for bugs and feature requests.

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏆 DTEmpire

**Made with ❤️ by DTEmpire**

- 🌐 **Website**: [DTEmpire ImgGen AI](https://imggen.ankitgupta.com.np/)
- 📱 **Discord**: [Join Our Server](http://dsc.gg/dtempire-server)
- 🤖 **Add Bot**: [Invite to Your Server](http://dsc.gg/dtempire)

## 🐛 Troubleshooting

### Common Issues

1. **Bot not responding in Discord**
   - Check bot permissions
   - Verify message content intent is enabled
   - Ensure bot is in the server

2. **Image generation fails**
   - Check API endpoint availability
   - Verify prompt length (max 500 characters)
   - Check network connectivity

3. **Web interface not loading**
   - Verify port 25580 is open
   - Check server logs for errors
   - Ensure all files are in correct locations

### Getting Help

- 📖 Check this README first
- 🐛 Open an issue on GitHub
- 💬 Join our [Discord server](http://dsc.gg/dtempire-server) for support

## 🔄 Changelog

### v1.0.0
- Initial release
- Discord bot with `.imggen` command
- Web interface with real-time generation
- Support for multiple AI models
- Responsive design

---

**⭐ Star this repository if you find it helpful!**

**🤖 Happy generating with DTEmpire AI!**
