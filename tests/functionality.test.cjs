const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const base = require("node:path").resolve(__dirname, "..") + "/";
function el() {
  const classes = new Set();
  return {
    value: "",
    disabled: false,
    style: {},
    textContent: "",
    className: "",
    dataset: {},
    children: [],
    classList: {
      add: (x) => classes.add(x),
      remove: (x) => classes.delete(x),
      contains: (x) => classes.has(x),
    },
    addEventListener() {},
    appendChild(x) {
      this.children.push(x);
    },
    focus() {},
  };
}
function rpg() {
  let calls = 0,
    respond;
  const c = {
    gameState: {
      conversationHistory: [],
      player: {
        health: 10,
        maxHealth: 10,
        attack: 1,
        defense: 1,
        gold: 0,
        inventory: [],
      },
    },
    playerInput: el(),
    sendActionBtn: el(),
    quickBtns: [el()],
    healthSpan: el(),
    attackSpan: el(),
    defenseSpan: el(),
    goldSpan: el(),
    showLoading() {},
    addMessage() {},
    callClaudeAPI() {
      calls++;
      return new Promise((r) => (respond = r));
    },
  };
  vm.createContext(c);
  for (const f of ["adventure", "stats"])
    vm.runInContext(fs.readFileSync(base + "js/" + f + ".js", "utf8"), c);
  return { c, calls: () => calls, respond: (v) => respond(v) };
}
test("RPG ignores a second action while its first request is running", async () => {
  const x = rpg();
  x.c.playerInput.value = "first";
  const p = x.c.sendPlayerAction();
  x.c.playerInput.value = "second";
  x.c.sendPlayerAction();
  assert.equal(x.calls(), 1);
  x.respond("ok");
  await p;
});
test("RPG controls remain disabled after a fatal response", async () => {
  const x = rpg();
  x.c.playerInput.value = "fight";
  const p = x.c.sendPlayerAction();
  x.respond("[HEALTH: -10]");
  await p;
  assert.equal(x.c.playerInput.disabled, true);
  assert.equal(x.c.sendActionBtn.disabled, true);
});
