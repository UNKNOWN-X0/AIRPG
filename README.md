# AI RPG Adventure

[![HTML](https://img.shields.io/badge/HTML-5-E34F26?logo=html5&logoColor=white)](index.html)
[![CSS](https://img.shields.io/badge/CSS-3-1572B6?logo=css3&logoColor=white)](styles.css)
[![JavaScript](https://img.shields.io/badge/JavaScript-vanilla-F7DF1E?logo=javascript&logoColor=black)](js/)
[![Anthropic API](https://img.shields.io/badge/AI-Anthropic%20API-D97757)](https://docs.anthropic.com/en/api/messages)

A small browser-based fantasy RPG. Claude acts as the dungeon master: describe
what your character does, read the story response, and follow your health,
attack, defense, and gold as the adventure unfolds.

## Features

- Free-form player actions and quick-action buttons.
- A fantasy adventure guided by Claude.
- Health, attack, defense, and gold displayed as you play.
- Responses can update stats with tags such as `[HEALTH: -15]` and `[GOLD: +25]`.
- Separate JavaScript files for game state, setup, story flow, API requests,
  stats, and the page interface.

## Run it

This project has no build step or package installation. Clone the repository,
open its folder in VS Code, and use the Live Server extension to open
`index.html`.

Enter an Anthropic API key on the start screen to begin. The key is kept in
memory for the current page session and is cleared when the page reloads. The
browser sends requests directly to Anthropic; never publish your key or commit
it to this repository. API usage may incur charges under your Anthropic
account.

## Project files

```text
index.html       Page structure and ordered script loading
styles.css       Layout and visual styles
js/state.js      Game state and player stats
js/dom.js        References to page elements
js/setup.js      Startup, key entry, and quick actions
js/adventure.js  Story requests, player turns, and loading state
js/api.js        Anthropic Messages API request
js/stats.js      Stat-tag parsing and display updates
js/ui.js         Story messages and page startup
```

The JavaScript files are classic scripts that share one page scope. Keep their
loading order in `index.html` when adding or moving a module.

## Customize

- Change the starting player stats and inventory in `js/state.js`.
- Edit the dungeon-master instructions in `js/setup.js`.
- Adjust the Claude model and request settings in `js/api.js`.
- Add stat tags in `js/stats.js` and explain them in the prompt in
  `js/setup.js`.
