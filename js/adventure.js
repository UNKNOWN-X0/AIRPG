let adventureRequestPending = false;

function setAdventureBusy(busy) {
  adventureRequestPending = busy;
  saveApiKeyBtn.disabled = busy;
  const disabled =
    busy || !gameState.adventureStarted || gameState.player.health <= 0;
  playerInput.disabled = disabled;
  sendActionBtn.disabled = disabled;
  quickBtns.forEach((button) => {
    button.disabled = disabled;
  });
  showLoading(busy);
}

async function startAdventure() {
  if (
    adventureRequestPending ||
    gameState.adventureStarted ||
    gameState.player.health <= 0
  )
    return;
  setAdventureBusy(true);

  try {
    const response = await callClaudeAPI(gameState.conversationHistory);
    gameState.adventureStarted = true;
    addMessage(response, "ai");
    parseStatChanges(response);
    gameState.conversationHistory.push({
      role: "assistant",
      content: response,
    });
  } catch (error) {
    addMessage(
      `Error: ${error.message}. Check your key or connection and try again.`,
      "system",
    );
    apiSetup.style.display = "flex";
  } finally {
    setAdventureBusy(false);
  }
}

async function sendPlayerAction() {
  if (
    adventureRequestPending ||
    !gameState.adventureStarted ||
    gameState.player.health <= 0
  )
    return;
  const action = playerInput.value.trim();
  if (!action) return;

  playerInput.value = "";
  setAdventureBusy(true);

  // Commit the turn only after a successful response.
  const turn = {
    role: "user",
    content: `Player action: ${action}\n\nCurrent stats - Health: ${gameState.player.health}/${gameState.player.maxHealth}, Attack: ${gameState.player.attack}, Defense: ${gameState.player.defense}, Gold: ${gameState.player.gold}`,
  };

  try {
    const response = await callClaudeAPI([
      ...gameState.conversationHistory,
      turn,
    ]);
    gameState.conversationHistory.push(turn, {
      role: "assistant",
      content: response,
    });
    addMessage(action, "player");
    addMessage(response, "ai");

    // Parse stat changes from response
    parseStatChanges(response);
  } catch (error) {
    playerInput.value = action;
    apiSetup.style.display = "flex";
    addMessage(
      `Error: ${error.message}. Your action has not been saved; you can retry.`,
      "system",
    );
  } finally {
    setAdventureBusy(false);
  }
  if (!playerInput.disabled) playerInput.focus();
}
