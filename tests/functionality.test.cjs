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
    respond,
    reject;
  const c = {
    gameState: {
      adventureStarted: true,
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
    apiSetup: el(),
    saveApiKeyBtn: el(),
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
      return new Promise((r, j) => {
        respond = r;
        reject = j;
      });
    },
  };
  vm.createContext(c);
  for (const f of ["adventure", "stats"])
    vm.runInContext(fs.readFileSync(base + "js/" + f + ".js", "utf8"), c);
  return {
    c,
    calls: () => calls,
    respond: (v) => respond(v),
    reject: (e) => reject(e),
  };
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

test("opening response applies stat changes", async () => {
  const x = rpg();
  x.c.gameState.adventureStarted = false;
  const pending = x.c.startAdventure();
  x.respond("You find coins. [GOLD: +5]");
  await pending;
  assert.equal(x.c.gameState.player.gold, 5);
  assert.equal(x.c.gameState.adventureStarted, true);
});
test("all stat changes in a response apply in order", () => {
  const x = rpg();
  x.c.parseStatChanges("[HEALTH: -8] [HEALTH: +3] [GOLD: +8] [GOLD: -2]");
  assert.equal(x.c.gameState.player.health, 5);
  assert.equal(x.c.gameState.player.gold, 6);
});
test("failed action preserves history and restores input for retry", async () => {
  const x = rpg();
  x.c.playerInput.value = "explore";
  const pending = x.c.sendPlayerAction();
  x.reject(new Error("temporarily unavailable"));
  await pending;
  assert.equal(x.c.gameState.conversationHistory.length, 0);
  assert.equal(x.c.playerInput.value, "explore");
  assert.equal(x.c.sendActionBtn.disabled, false);
});
test("failed opening allows key replacement and prevents gameplay", async () => {
  const x = rpg();
  x.c.gameState.adventureStarted = false;
  x.c.apiSetup.style.display = "none";
  const pending = x.c.startAdventure();
  x.reject(new Error("invalid key"));
  await pending;
  assert.equal(x.c.apiSetup.style.display, "flex");
  assert.equal(x.c.sendActionBtn.disabled, true);
  assert.equal(x.c.quickBtns[0].disabled, true);
});
function api(fetch) {
  const c = {
    fetch,
    gameState: { apiKey: "test-only" },
    AbortController,
    setTimeout,
    clearTimeout,
  };
  vm.createContext(c);
  vm.runInContext(fs.readFileSync(base + "js/api.js", "utf8"), c);
  return c.callClaudeAPI;
}
test("API supports direct browser access and returns all text blocks", async () => {
  const call = api(async (url, request) => {
    assert.equal(
      request.headers["anthropic-dangerous-direct-browser-access"],
      "true",
    );
    assert.notEqual(JSON.parse(request.body).model, "claude-sonnet-4-20250514");
    return {
      ok: true,
      json: async () => ({
        content: [
          { type: "text", text: "A" },
          { type: "text", text: "B" },
        ],
      }),
    };
  });
  assert.equal(await call([]), "A\nB");
});
test("API reports HTTP status when error body is not JSON", async () => {
  const call = api(async () => ({
    ok: false,
    status: 502,
    json: async () => {
      throw new SyntaxError("html");
    },
  }));
  await assert.rejects(call([]), /502/);
});
test("API rejects empty responses instead of recording undefined", async () => {
  const call = api(async () => ({
    ok: true,
    json: async () => ({ content: [] }),
  }));
  await assert.rejects(call([]), /text/i);
});
test("a retry records exactly one turn and does not repeat stale inventory", async () => {
  const x = rpg();
  x.c.playerInput.value = "drink potion";
  let pending = x.c.sendPlayerAction();
  x.reject(new Error("offline"));
  await pending;
  pending = x.c.sendPlayerAction();
  x.respond("Potion consumed. [HEALTH: +2]");
  await pending;
  assert.equal(x.c.gameState.conversationHistory.length, 2);
  assert.doesNotMatch(
    x.c.gameState.conversationHistory[0].content,
    /Inventory:/,
  );
  assert.equal(x.c.playerInput.value, "");
});
test("setup validates keys and replacement does not restart an existing story", () => {
  const x = rpg();
  const status = el();
  Object.assign(x.c, {
    apiKeyInput: el(),
    gameArea: el(),
    document: { getElementById: () => status },
  });
  vm.runInContext(fs.readFileSync(base + "js/setup.js", "utf8"), x.c);
  x.c.saveApiKey();
  assert.match(status.textContent, /enter your API key/);
  x.c.gameState.conversationHistory.push({
    role: "assistant",
    content: "existing story",
  });
  x.c.apiKeyInput.value = " test-only ";
  x.c.saveApiKey();
  assert.equal(x.c.gameState.apiKey, "test-only");
  assert.equal(x.c.apiKeyInput.value, "");
  assert.equal(x.calls(), 0);
  assert.equal(x.c.gameState.conversationHistory.length, 1);
});
test("API timeout releases the request with a useful error", async () => {
  let expire,
    cleared = false;
  const c = {
    gameState: { apiKey: "test-only" },
    AbortController,
    setTimeout: (callback) => {
      expire = callback;
      return 1;
    },
    clearTimeout: () => {
      cleared = true;
    },
    fetch: async (url, { signal }) =>
      new Promise((resolve, reject) => {
        signal.addEventListener("abort", () => reject(new Error("aborted")));
      }),
  };
  vm.createContext(c);
  vm.runInContext(fs.readFileSync(base + "js/api.js", "utf8"), c);
  const pending = c.callClaudeAPI([]);
  expire();
  await assert.rejects(pending, /timed out/);
  assert.equal(cleared, true);
});
test("all modules initialize, open an adventure, and wire each quick action", async () => {
  const nodes = {};
  function element() {
    const node = el();
    node.events = {};
    node.addEventListener = (name, handler) => {
      node.events[name] = handler;
    };
    return node;
  }
  const quick = [
    "look around",
    "check inventory",
    "rest",
    "continue adventure",
  ].map((action) => {
    const button = element();
    button.dataset.action = action;
    return button;
  });
  const requests = [];
  const context = {
    AbortController,
    setTimeout,
    clearTimeout,
    document: {
      getElementById: (id) => (nodes[id] ||= element()),
      querySelectorAll: () => quick,
      createElement: element,
    },
    fetch: async (url, options) => {
      requests.push(JSON.parse(options.body));
      return {
        ok: true,
        json: async () => ({
          content: [{ type: "text", text: "<b>Story</b> [GOLD: +1]" }],
        }),
      };
    },
  };
  vm.createContext(context);
  for (const name of [
    "state",
    "dom",
    "setup",
    "adventure",
    "api",
    "stats",
    "ui",
  ])
    vm.runInContext(
      fs.readFileSync(base + "js/" + name + ".js", "utf8"),
      context,
    );
  const settle = () => new Promise((resolve) => setImmediate(resolve));
  nodes.apiKeyInput.value = "test-only";
  nodes.saveApiKey.events.click();
  await settle();
  assert.equal(nodes.gold.textContent, 51);
  assert.equal(nodes.sendAction.disabled, false);
  assert.equal(
    nodes.storyPanel.children.at(-1).textContent,
    "<b>Story</b> [GOLD: +1]",
  );
  for (const button of quick) {
    button.events.click();
    await settle();
    assert.ok(
      requests
        .at(-1)
        .messages.at(-1)
        .content.startsWith("Player action: " + button.dataset.action),
    );
  }
  assert.equal(requests.length, 5);
  assert.equal(nodes.gold.textContent, 55);
});
