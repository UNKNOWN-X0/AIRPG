# AIRPG

## Module map

- `index.html`: page layout and ordered script loading.
- `js/state.js`, `js/dom.js`: game data and element references.
- `js/setup.js`: initialization and API-key controls.
- `js/adventure.js`: player actions and conversation flow.
- `js/api.js`: Claude requests.
- `js/stats.js`: stat parsing and display.
- `js/ui.js`: messages, loading feedback, and startup.
- `styles.css`: presentation.

The feature files are classic scripts sharing the original scope. Keep their order in `index.html`; no bundler is needed. Preview with Live Server. API access still uses the existing implementation.
