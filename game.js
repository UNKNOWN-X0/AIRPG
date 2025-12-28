// Game State
const gameState = {
    apiKey: '',
    player: {
        health: 100,
        maxHealth: 100,
        attack: 10,
        defense: 5,
        gold: 50,
        inventory: ['rusty sword', 'wooden shield']
    },
    conversationHistory: []
};

// DOM Elements
const apiKeyInput = document.getElementById('apiKeyInput');
const saveApiKeyBtn = document.getElementById('saveApiKey');
const apiSetup = document.getElementById('apiSetup');
const gameArea = document.getElementById('gameArea');
const storyPanel = document.getElementById('storyPanel');
const playerInput = document.getElementById('playerInput');
const sendActionBtn = document.getElementById('sendAction');
const loading = document.getElementById('loading');
const quickBtns = document.querySelectorAll('.quick-btn');

// Stats Elements
const healthSpan = document.getElementById('health');
const attackSpan = document.getElementById('attack');
const defenseSpan = document.getElementById('defense');
const goldSpan = document.getElementById('gold');

// Initialize Game
function initGame() {
    // Check if API key exists in memory
    if (gameState.apiKey) {
        showGameArea();
    }

    saveApiKeyBtn.addEventListener('click', saveApiKey);
    sendActionBtn.addEventListener('click', sendPlayerAction);
    playerInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendPlayerAction();
    });

    quickBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            playerInput.value = btn.dataset.action;
            sendPlayerAction();
        });
    });

    // Initialize conversation with system prompt
    gameState.conversationHistory = [{
        role: "user",
        content: `You are a creative dungeon master for a text-based RPG game. The player starts with:
- Health: ${gameState.player.health}/${gameState.player.maxHealth}
- Attack: ${gameState.player.attack}
- Defense: ${gameState.player.defense}
- Gold: ${gameState.player.gold}
- Inventory: ${gameState.player.inventory.join(', ')}

Rules:
1. Create engaging fantasy adventures with choices and consequences
2. When combat occurs, describe it dramatically and indicate stat changes like: [HEALTH: -15] or [GOLD: +25]
3. Allow the player to find items, gain experience, and face challenges
4. Keep responses concise (2-4 paragraphs) and end with what the player can do next
5. Track inventory changes and mention them when relevant
6. Be creative and adapt to player actions

Start the adventure now in a fantasy setting.`
    }];
}

function saveApiKey() {
    const key = apiKeyInput.value.trim();
    if (!key) {
        alert('Please enter a valid API key');
        return;
    }
    
    gameState.apiKey = key;
    showGameArea();
    startAdventure();
}

function showGameArea() {
    apiSetup.style.display = 'none';
    gameArea.style.display = 'block';
    playerInput.disabled = false;
    sendActionBtn.disabled = false;
}

async function startAdventure() {
    showLoading(true);
    
    try {
        const response = await callClaudeAPI(gameState.conversationHistory);
        addMessage(response, 'ai');
        gameState.conversationHistory.push({
            role: "assistant",
            content: response
        });
    } catch (error) {
        addMessage(`Error: ${error.message}. Please check your API key.`, 'system');
    }
    
    showLoading(false);
}

async function sendPlayerAction() {
    const action = playerInput.value.trim();
    if (!action) return;

    addMessage(action, 'player');
    playerInput.value = '';
    playerInput.disabled = true;
    sendActionBtn.disabled = true;
    showLoading(true);

    // Add player action to history
    gameState.conversationHistory.push({
        role: "user",
        content: `Player action: ${action}\n\nCurrent stats - Health: ${gameState.player.health}/${gameState.player.maxHealth}, Attack: ${gameState.player.attack}, Defense: ${gameState.player.defense}, Gold: ${gameState.player.gold}, Inventory: ${gameState.player.inventory.join(', ')}`
    });

    try {
        const response = await callClaudeAPI(gameState.conversationHistory);
        
        // Parse stat changes from response
        parseStatChanges(response);
        
        addMessage(response, 'ai');
        gameState.conversationHistory.push({
            role: "assistant",
            content: response
        });
    } catch (error) {
        addMessage(`Error: ${error.message}`, 'system');
    }

    showLoading(false);
    playerInput.disabled = false;
    sendActionBtn.disabled = false;
    playerInput.focus();
}

async function callClaudeAPI(messages) {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': gameState.apiKey,
            'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 1024,
            messages: messages
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'API request failed');
    }

    const data = await response.json();
    return data.content[0].text;
}

function parseStatChanges(text) {
    // Look for stat change patterns like [HEALTH: -15] or [GOLD: +25]
    const healthMatch = text.match(/\[HEALTH:\s*([+-]?\d+)\]/i);
    const goldMatch = text.match(/\[GOLD:\s*([+-]?\d+)\]/i);
    const attackMatch = text.match(/\[ATTACK:\s*([+-]?\d+)\]/i);
    const defenseMatch = text.match(/\[DEFENSE:\s*([+-]?\d+)\]/i);

    if (healthMatch) {
        gameState.player.health = Math.max(0, Math.min(gameState.player.maxHealth, gameState.player.health + parseInt(healthMatch[1])));
        updateStats();
    }
    if (goldMatch) {
        gameState.player.gold = Math.max(0, gameState.player.gold + parseInt(goldMatch[1]));
        updateStats();
    }
    if (attackMatch) {
        gameState.player.attack += parseInt(attackMatch[1]);
        updateStats();
    }
    if (defenseMatch) {
        gameState.player.defense += parseInt(defenseMatch[1]);
        updateStats();
    }

    // Check for death
    if (gameState.player.health <= 0) {
        addMessage('💀 You have fallen in battle! Your adventure ends here...', 'system');
        playerInput.disabled = true;
        sendActionBtn.disabled = true;
    }
}

function updateStats() {
    healthSpan.textContent = `${gameState.player.health}/${gameState.player.maxHealth}`;
    attackSpan.textContent = gameState.player.attack;
    defenseSpan.textContent = gameState.player.defense;
    goldSpan.textContent = gameState.player.gold;

    // Color code health
    const healthPercent = (gameState.player.health / gameState.player.maxHealth) * 100;
    if (healthPercent <= 25) {
        healthSpan.style.color = '#f44336';
    } else if (healthPercent <= 50) {
        healthSpan.style.color = '#ff9800';
    } else {
        healthSpan.style.color = '#4caf50';
    }
}

function addMessage(text, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}-message`;
    messageDiv.textContent = text;
    storyPanel.appendChild(messageDiv);
    storyPanel.scrollTop = storyPanel.scrollHeight;
}

function showLoading(show) {
    loading.style.display = show ? 'block' : 'none';
    gameArea.style.display = show ? 'none' : 'block';
}

// Start the game
initGame();
