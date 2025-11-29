class ImageGenerator {
    constructor() {
        this.currentImageData = null;
        this.initializeEventListeners();
        this.checkBotStatus();
        this.loadRecentImages();
        setInterval(() => this.checkBotStatus(), 30000);
        setInterval(() => this.loadRecentImages(), 60000);
    }

    initializeEventListeners() {
        // Form submission
        document.getElementById('generateForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.generateImage();
        });

        // Character count
        document.getElementById('prompt').addEventListener('input', (e) => {
            document.getElementById('charCount').textContent = e.target.value.length;
        });

        // Action buttons
        document.getElementById('downloadBtn').addEventListener('click', () => this.downloadImage());
        document.getElementById('generateAgainBtn').addEventListener('click', () => this.showGenerator());
    }

    async checkBotStatus() {
        try {
            const response = await fetch('/bot-status');
            const data = await response.json();
            
            const statusElement = document.getElementById('botStatus');
            const statusDot = statusElement.querySelector('.status-dot');
            const statusText = statusElement.querySelector('span:last-child');
            
            if (data.status === 'online') {
                statusDot.classList.add('online');
                statusText.textContent = `Bot Online - ${data.username} (${data.guilds} servers)`;
                statusText.style.cursor = 'pointer';
                statusText.title = 'Click to add bot to your server';
                statusText.onclick = () => window.open('http://dsc.gg/dtempire', '_blank');
            } else {
                statusDot.classList.remove('online');
                statusText.textContent = 'Bot Offline';
                statusText.style.cursor = 'default';
                statusText.onclick = null;
            }
        } catch (error) {
            console.error('Failed to check bot status:', error);
        }
    }

    async generateImage() {
        const form = document.getElementById('generateForm');
        const generateBtn = document.getElementById('generateBtn');
        const prompt = document.getElementById('prompt').value.trim();
        const model = document.getElementById('model').value;
        const width = document.getElementById('width').value;
        const height = document.getElementById('height').value;

        if (!prompt) {
            alert('Please enter a prompt');
            return;
        }

        // Show loading with current prompt
        this.showLoading(prompt, model);

        // Disable button
        generateBtn.disabled = true;
        generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';

        try {
            const startTime = Date.now();
            const response = await fetch('/generate-image', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt: prompt,
                    model: model,
                    width: parseInt(width),
                    height: parseInt(height)
                })
            });

            const data = await response.json();
            const generationTime = Date.now() - startTime;

            if (data.success) {
                this.showResult(data.data, prompt, model, generationTime);
            } else {
                throw new Error(data.error || 'Failed to generate image');
            }
        } catch (error) {
            console.error('Generation error:', error);
            this.showError(prompt, model, error.message);
        } finally {
            generateBtn.disabled = false;
            generateBtn.innerHTML = '<i class="fas fa-sparkles"></i> Generate Image';
        }
    }

    showLoading(prompt, model) {
        document.getElementById('generateForm').classList.add('hidden');
        document.getElementById('result').classList.add('hidden');
        document.getElementById('error').classList.add('hidden');
        
        // Update loading display
        document.getElementById('loadingPrompt').textContent = prompt;
        document.getElementById('loadingModel').textContent = this.formatModelName(model);
        
        document.getElementById('loading').classList.remove('hidden');
    }

    showResult(imageData, prompt, model, generationTime) {
        document.getElementById('loading').classList.add('hidden');
        document.getElementById('error').classList.add('hidden');
        
        const resultElement = document.getElementById('result');
        const imgElement = document.getElementById('generatedImage');
        
        imgElement.src = imageData.url;
        document.getElementById('resultPrompt').textContent = prompt;
        document.getElementById('resultModel').textContent = this.formatModelName(model);
        document.getElementById('resultTime').textContent = `${generationTime}ms`;
        document.getElementById('resultTimestamp').textContent = new Date().toLocaleString();
        
        // Store current image data for download
        this.currentImageData = imageData;
        
        resultElement.classList.remove('hidden');
        
        // Reload recent images
        this.loadRecentImages();
    }

    showError(prompt, model, errorMessage) {
        document.getElementById('loading').classList.add('hidden');
        document.getElementById('result').classList.add('hidden');
        
        document.getElementById('errorPrompt').textContent = prompt;
        document.getElementById('errorModel').textContent = this.formatModelName(model);
        document.getElementById('errorMessage').textContent = errorMessage;
        
        document.getElementById('error').classList.remove('hidden');
    }

    showGenerator() {
        document.getElementById('result').classList.add('hidden');
        document.getElementById('error').classList.add('hidden');
        document.getElementById('loading').classList.add('hidden');
        document.getElementById('generateForm').classList.remove('hidden');
    }

    downloadImage() {
        if (this.currentImageData) {
            const link = document.createElement('a');
            link.href = this.currentImageData.url;
            link.download = `dtempire-ai-${Date.now()}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }

    async loadRecentImages() {
        try {
            const response = await fetch('/recent-images');
            const data = await response.json();
            
            const container = document.getElementById('recentImages');
            
            if (data.images && data.images.length > 0) {
                container.innerHTML = data.images.map(image => `
                    <div class="recent-image-item" onclick="imageGenerator.viewImage('${image.url}')">
                        <img src="${image.url}" alt="${image.prompt}" onerror="this.style.display='none'">
                        <div class="recent-image-info">
                            <p><strong>Prompt:</strong> ${this.truncateText(image.prompt, 30)}</p>
                            <p><strong>Model:</strong> ${this.formatModelName(image.model)}</p>
                        </div>
                    </div>
                `).join('');
            } else {
                container.innerHTML = '<p style="color: #b0b0b0; text-align: center; grid-column: 1 / -1;">No recent images generated yet.</p>';
            }
        } catch (error) {
            console.error('Failed to load recent images:', error);
        }
    }

    formatModelName(model) {
        const modelNames = {
            'flux': 'Flux',
            'turbo': 'Turbo',
            'kontext': 'Kontext'
        };
        return modelNames[model] || model;
    }

    truncateText(text, maxLength) {
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }

    viewImage(url) {
        window.open(url, '_blank');
    }
}

// Initialize the application
const imageGenerator = new ImageGenerator();

// Add some sample prompts for inspiration
const samplePrompts = [
    "a majestic dragon flying over a medieval castle at sunset",
    "cyberpunk cityscape with neon lights and flying cars", 
    "peaceful zen garden with cherry blossoms and koi pond",
    "astronaut riding a horse in space with galaxies in background",
    "steampunk laboratory with brass gadgets and glowing crystals"
];

// Add sample prompt to placeholder for inspiration
document.getElementById('prompt').placeholder = samplePrompts[Math.floor(Math.random() * samplePrompts.length)];