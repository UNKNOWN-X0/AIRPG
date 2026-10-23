// Initialize Game
function initGame() {
  // Check if API key exists in memory
  if (gameState.apiKey) {
    showGameArea();
  }

  saveApiKeyBtn.addEventListener("click", saveApiKey);
  sendActionBtn.addEventListener("click", sendPlayerAction);
  playerInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendPlayerAction();
  });

  quickBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      playerInput.value = btn.dataset.action;
      sendPlayerAction();
    });
  });

  // Initialize conversation with system prompt
  gameState.conversationHistory = [
    {
      role: "user",
      content: `You are a creative dungeon master for a text-based RPG game. The player starts with:
- Health: ${gameState.player.health}/${gameState.player.maxHealth}
- Attack: ${gameState.player.attack}
- Defense: ${gameState.player.defense}
- Gold: ${gameState.player.gold}
- Inventory: ${gameState.player.inventory.join(", ")}

Rules:
1. Create engaging fantasy adventures with choices and consequences
2. When combat occurs, describe it dramatically and indicate stat changes like: [HEALTH: -15] or [GOLD: +25]
3. Allow the player to find items, gain experience, and face challenges
4. Keep responses concise (2-4 paragraphs) and end with what the player can do next
5. Track inventory changes and mention them when relevant
6. Be creative and adapt to player actions

Start the adventure now in a fantasy setting.`,
    },
  ];
}

function saveApiKey() {
  const key = apiKeyInput.value.trim();
  if (!key) {
    alert("Please enter a valid API key");
    return;
  }

  gameState.apiKey = key;
  showGameArea();
  startAdventure();
}

function showGameArea() {
  apiSetup.style.display = "none";
  gameArea.style.display = "block";
  playerInput.disabled = false;
  sendActionBtn.disabled = false;
}

