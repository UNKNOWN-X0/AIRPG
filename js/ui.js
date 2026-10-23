function addMessage(text, type) {
  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${type}-message`;
  messageDiv.textContent = text;
  storyPanel.appendChild(messageDiv);
  storyPanel.scrollTop = storyPanel.scrollHeight;
}

function showLoading(show) {
  loading.style.display = show ? "block" : "none";
  gameArea.style.display = show ? "none" : "block";
}

// Start the game
initGame();
