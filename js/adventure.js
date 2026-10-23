let adventureRequestPending = false;

function setAdventureBusy(busy) {
  adventureRequestPending = busy;
  const disabled = busy || gameState.player.health <= 0;
  playerInput.disabled = disabled;
  sendActionBtn.disabled = disabled;
  quickBtns.forEach((button) => {
    button.disabled = disabled;
  });
  showLoading(busy);
}

async function startAdventure() {
  if (adventureRequestPending || gameState.player.health <= 0) return;
  setAdventureBusy(true);

  try {
    const response = await callClaudeAPI(gameState.conversationHistory);
    addMessage(response, "ai");
    gameState.conversationHistory.push({
      role: "assistant",
      content: response,
    });
  } catch (error) {
    addMessage(`Error: ${error.message}. Please check your API key.`, "system");
  }

  setAdventureBusy(false);
}

async function sendPlayerAction() {
  if (adventureRequestPending || gameState.player.health <= 0) return;
  const action = playerInput.value.trim();
  if (!action) return;

  addMessage(action, "player");
  playerInput.value = "";
  setAdventureBusy(true);

  // Add player action to history
  gameState.conversationHistory.push({
    role: "user",
    content: `Player action: ${action}\n\nCurrent stats - Health: ${gameState.player.health}/${gameState.player.maxHealth}, Attack: ${gameState.player.attack}, Defense: ${gameState.player.defense}, Gold: ${gameState.player.gold}, Inventory: ${gameState.player.inventory.join(", ")}`,
  });

  try {
    const response = await callClaudeAPI(gameState.conversationHistory);

    // Parse stat changes from response
    parseStatChanges(response);

    addMessage(response, "ai");
    gameState.conversationHistory.push({
      role: "assistant",
      content: response,
    });
  } catch (error) {
    addMessage(`Error: ${error.message}`, "system");
  }

  setAdventureBusy(false);
  if (!playerInput.disabled) playerInput.focus();
}
