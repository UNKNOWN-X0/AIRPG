# Graph Report - AIRPG  (2026-10-24)

## Corpus Check
- Corpus is ~2,424 words - fits in a single context window. You may not need a graph.

## Summary
- 70 nodes · 70 edges · 11 communities (7 shown, 4 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.85)
- Token cost: unavailable (agent usage metadata was not exposed)

## Community Hubs (Navigation)
- AI RPG Interface
- DOM Bindings
- API and Functionality Tests
- GitHub Pages Workflow
- CI Build Steps
- Adventure Flow
- Setup and API Key
- Character Stats
- Game State

## God Nodes (most connected - your core abstractions)
1. `AI RPG Adventure page` - 5 edges
2. `steps` - 4 edges
3. `initGame()` - 4 edges
4. `build` - 3 edges
5. `setAdventureBusy()` - 3 edges
6. `sendPlayerAction()` - 3 edges
7. `saveApiKey()` - 3 edges
8. `showGameArea()` - 3 edges
9. `el()` - 3 edges
10. `AI RPG Adventure README` - 3 edges

## Surprising Connections (you probably didn't know these)
- `initGame()` --indirect_call--> `sendPlayerAction()`  [INFERRED]
  js/setup.js → js/adventure.js
- `Story response panel` --references--> `Claude as dungeon master`  [EXTRACTED]
  index.html → README.md
- `Game stats panel` --references--> `Health, attack, defense, and gold stats`  [EXTRACTED]
  index.html → README.md
- `Anthropic API key entry` --references--> `API key stays in memory for the page session`  [EXTRACTED]
  index.html → README.md

## Import Cycles
- None detected.

## Communities (11 total, 4 thin omitted)

### Community 0 - "AI RPG Interface"
Cohesion: 0.14
Nodes (13): AI RPG Adventure page, Anthropic API key entry, Game stats panel, Player action input, Quick action buttons, Story response panel, AI RPG Adventure README, Bracketed tags update player stats (+5 more)

### Community 1 - "DOM Bindings"
Cohesion: 0.14
Nodes (13): apiKeyInput, apiSetup, attackSpan, defenseSpan, gameArea, goldSpan, healthSpan, loading (+5 more)

### Community 2 - "API and Functionality Tests"
Cohesion: 0.28
Nodes (3): el(), element(), rpg()

### Community 3 - "GitHub Pages Workflow"
Cohesion: 0.25
Nodes (7): jobs, name, branches, branches, True, pull_request, push

### Community 4 - "CI Build Steps"
Cohesion: 0.33
Nodes (6): runs-on, steps, build, name, run, uses

### Community 5 - "Adventure Flow"
Cohesion: 0.83
Nodes (3): sendPlayerAction(), setAdventureBusy(), startAdventure()

### Community 6 - "Setup and API Key"
Cohesion: 1.00
Nodes (3): initGame(), saveApiKey(), showGameArea()

## Knowledge Gaps
- **5 isolated node(s):** `Free-form player actions`, `Bracketed tags update player stats`, `Browser sends requests directly to Anthropic`, `Player action input`, `Quick action buttons`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 37 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `build` connect `CI Build Steps` to `GitHub Pages Workflow`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **What connects `Free-form player actions`, `Bracketed tags update player stats`, `Browser sends requests directly to Anthropic` to the rest of the system?**
  _5 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AI RPG Interface` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._
- **Why does `jobs` connect `GitHub Pages Workflow` to `CI Build Steps`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **Should `DOM Bindings` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._