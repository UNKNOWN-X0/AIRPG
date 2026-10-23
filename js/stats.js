function parseStatChanges(text) {
  // Apply every tag in narrative order, preserving existing stat bounds.
  for (const match of text.matchAll(
    /\[(HEALTH|GOLD|ATTACK|DEFENSE):\s*([+-]?\d+)\]/gi,
  )) {
    const stat = match[1].toLowerCase();
    const value = gameState.player[stat] + Number(match[2]);
    gameState.player[stat] =
      stat === "health"
        ? Math.max(0, Math.min(gameState.player.maxHealth, value))
        : stat === "gold"
          ? Math.max(0, value)
          : value;
  }
  updateStats();

  // Check for death
  if (gameState.player.health <= 0) {
    addMessage(
      "💀 You have fallen in battle! Your adventure ends here...",
      "system",
    );
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
  const healthPercent =
    (gameState.player.health / gameState.player.maxHealth) * 100;
  if (healthPercent <= 25) {
    healthSpan.style.color = "#f44336";
  } else if (healthPercent <= 50) {
    healthSpan.style.color = "#ff9800";
  } else {
    healthSpan.style.color = "#4caf50";
  }
}
