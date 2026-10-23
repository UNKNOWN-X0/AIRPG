function parseStatChanges(text) {
  // Look for stat change patterns like [HEALTH: -15] or [GOLD: +25]
  const healthMatch = text.match(/\[HEALTH:\s*([+-]?\d+)\]/i);
  const goldMatch = text.match(/\[GOLD:\s*([+-]?\d+)\]/i);
  const attackMatch = text.match(/\[ATTACK:\s*([+-]?\d+)\]/i);
  const defenseMatch = text.match(/\[DEFENSE:\s*([+-]?\d+)\]/i);

  if (healthMatch) {
    gameState.player.health = Math.max(
      0,
      Math.min(
        gameState.player.maxHealth,
        gameState.player.health + parseInt(healthMatch[1]),
      ),
    );
    updateStats();
  }
  if (goldMatch) {
    gameState.player.gold = Math.max(
      0,
      gameState.player.gold + parseInt(goldMatch[1]),
    );
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

