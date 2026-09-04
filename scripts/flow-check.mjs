import { readFileSync } from "node:fs";
import { spawn } from "node:child_process";
import { createConnection } from "node:net";
import { setTimeout as sleep } from "node:timers/promises";

const PLAYER_SRC = readFileSync(new URL("../src/data/players.ts", import.meta.url), "utf8");
const PLAYER_RE =
  /player\(\s*"([^"]+)",\s*"([^"]+)",\s*(\d+),\s*[^,]+,\s*(\d+),\s*"([^"]+)"/g;
const PLAYERS = [...PLAYER_SRC.matchAll(PLAYER_RE)].map((match) => ({
  id: match[1],
  fullName: match[2],
  jersey: match[3],
  draftYear: match[4],
}));

function findPlayer(nameText) {
  const compact = nameText.replace(/\s+/g, " ").trim().toLowerCase();
  const hit = PLAYERS.find((player) => player.fullName.toLowerCase() === compact);
  if (!hit) throw new Error(`No dataset match for ${nameText}`);
  return hit;
}

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9333;
const BASE = "http://127.0.0.1:5173/";

function waitForPort(port, tries = 40) {
  return new Promise((resolve, reject) => {
    const attempt = (left) => {
      const socket = createConnection({ port, host: "127.0.0.1" }, () => {
        socket.end();
        resolve();
      });
      socket.on("error", () => {
        socket.destroy();
        if (left <= 0) reject(new Error("Chrome debug port never opened"));
        else setTimeout(() => attempt(left - 1), 150);
      });
    };
    attempt(tries);
  });
}

async function cdp() {
  const targets = await fetch(`http://127.0.0.1:${PORT}/json/list`).then((r) => r.json());
  const page = targets.find((t) => t.type === "page") ?? targets[0];
  const { webSocketDebuggerUrl } = page;
  const ws = new WebSocket(webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener("open", resolve);
    ws.addEventListener("error", reject);
  });
  let id = 0;
  const pending = new Map();
  ws.addEventListener("message", (event) => {
    const msg = JSON.parse(String(event.data));
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(JSON.stringify(msg.error)));
      else resolve(msg.result);
    }
  });
  const send = (method, params = {}) => {
    const next = ++id;
    ws.send(JSON.stringify({ id: next, method, params }));
    return new Promise((resolve, reject) => pending.set(next, { resolve, reject }));
  };
  return { ws, send };
}

async function evaluate(send, expression) {
  const result = await send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.text || "eval failed");
  }
  return result.result.value;
}

const chrome = spawn(
  CHROME,
  [
    `--remote-debugging-port=${PORT}`,
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    `--user-data-dir=/tmp/three-down-chrome`,
    BASE,
  ],
  { stdio: "ignore" },
);

try {
  await waitForPort(PORT);
  await sleep(800);
  const { ws, send } = await cdp();
  await send("Page.enable");
  await send("Runtime.enable");
  await send("Page.navigate", { url: BASE });
  await sleep(700);

  const first = await evaluate(
    send,
    `(() => {
      const h2 = document.querySelector("h2");
      const category = [...document.querySelectorAll("p")].find((p) => /JERSEY/.test(p.textContent || ""));
      return { name: h2?.innerText, category: category?.textContent };
    })()`,
  );
  if (!first.name) throw new Error("Player name missing on first question");
  const q1player = findPlayer(first.name);

  const setValue = async (value) => {
    await evaluate(
      send,
      `(() => {
        const input = document.querySelector("input");
        const proto = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value");
        proto.set.call(input, ${JSON.stringify(value)});
        input.dispatchEvent(new Event("input", { bubbles: true }));
      })()`,
    );
  };
  const submitForm = async () => {
    await evaluate(send, `document.querySelector("form").requestSubmit()`);
    await sleep(400);
  };

  const clickNamed = async (pattern) => {
    await evaluate(
      send,
      `[...document.querySelectorAll("button")].find(b => ${pattern}.test(b.textContent)).click()`,
    );
    await sleep(500);
  };
  const bodyText = async () => evaluate(send, `document.body.innerText`);
  const playerName = async () => evaluate(send, `document.querySelector("h2")?.innerText || ""`);

  await setValue(q1player.jersey === "99" ? "00" : "99");
  await submitForm();
  const afterWrong = await bodyText();
  if (!/2 attempts left/i.test(afterWrong)) throw new Error("Expected 2 attempts left after first miss");

  await setValue("08");
  await submitForm();
  const afterSecond = await bodyText();
  if (!/1 attempt left/i.test(afterSecond) && !/Correct|Missed/.test(afterSecond)) {
    throw new Error("Expected 1 attempt left or a resolved jersey");
  }

  if (/1 attempt left/i.test(afterSecond)) {
    await setValue(q1player.jersey);
    await submitForm();
  }
  const afterQ1 = await bodyText();
  if (!/Correct|Missed/.test(afterQ1)) throw new Error("Jersey did not resolve");
  await clickNamed("/Continue/i");

  const q2text = await bodyText();
  if (!/02 \/ 03/.test(q2text) || !/Draft Year/i.test(q2text)) throw new Error("Did not reach draft year question");
  const q2player = findPlayer(await playerName());
  await setValue("1999");
  await submitForm();
  const afterDraftWrong = await bodyText();
  if (!/2 attempts left/i.test(afterDraftWrong)) throw new Error("Expected 2 attempts left on draft year");
  await setValue(q2player.draftYear);
  await submitForm();
  const afterDraft = await bodyText();
  if (!/Correct/.test(afterDraft)) throw new Error("Expected correct draft year after recovery");
  await clickNamed("/Continue/i");

  const q3text = await bodyText();
  if (!/03 \/ 03/.test(q3text) || !/College/i.test(q3text)) throw new Error("Did not reach college question");
  await setValue("ls");
  await sleep(200);
  const suggestions = await evaluate(send, `[...document.querySelectorAll("[role=option]")].map(el => el.textContent)`);
  if (!Array.isArray(suggestions) || suggestions.length === 0) throw new Error("Autocomplete did not render options");

  for (let i = 0; i < 3; i += 1) {
    await setValue("zzzz university");
    await submitForm();
  }
  const q3lock = await bodyText();
  if (!/Missed/.test(q3lock)) throw new Error("College question should lock after 3 misses");
  await clickNamed("/Results/i");

  const results = await bodyText();
  if (!/\/ 3/.test(results) || !/Play Again/i.test(results)) throw new Error("Results screen missing");
  if (!/Jersey Number/i.test(results) || !/Draft Year/i.test(results) || !/College/i.test(results)) {
    throw new Error("Results breakdown incomplete");
  }

  await clickNamed("/Play Again/i");
  const again = await bodyText();
  if (!/01 \/ 03/.test(again) || !/Jersey/i.test(again)) throw new Error("Play Again did not reset");

  console.log("flow ok");
  console.log(JSON.stringify({ first, suggestions, scoreText: results.match(/\d \/ 3/)?.[0] }, null, 2));
  ws.close();
} finally {
  chrome.kill("SIGKILL");
}
