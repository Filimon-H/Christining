/**
 * A tiny Chrome DevTools Protocol driver, used to verify the site the way a
 * guest actually experiences it: load, scroll, wait, measure, screenshot.
 *
 * Chrome's `--screenshot` flag captures before hydration and cannot scroll, so
 * it can't verify scroll-triggered reveals. Node's built-in WebSocket (Node 22+,
 * and available in 20 behind the flag it ships enabled) is enough to drive CDP
 * directly without adding Playwright as a dependency.
 *
 *   node scripts/cdp.mjs <url> <outDir>
 */
import { writeFileSync } from "node:fs";

const [, , url = "http://localhost:3000/?skipEnvelope", outDir = "."] =
  process.argv;

const targets = await (await fetch("http://localhost:9222/json")).json();
const page = targets.find((t) => t.type === "page");
if (!page) {
  console.error("No page target. Start Chrome with --remote-debugging-port=9222");
  process.exit(1);
}

const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  ws.addEventListener("open", resolve, { once: true });
  ws.addEventListener("error", reject, { once: true });
});

let nextId = 0;
const pending = new Map();

ws.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  const resolver = pending.get(message.id);
  if (resolver) {
    pending.delete(message.id);
    resolver(message.result ?? {});
  }
});

const send = (method, params = {}) =>
  new Promise((resolve) => {
    const id = ++nextId;
    pending.set(id, resolve);
    ws.send(JSON.stringify({ id, method, params }));
  });

const evaluate = async (expression) => {
  const result = await send("Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  return result?.result?.value;
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const shoot = async (name) => {
  const { data } = await send("Page.captureScreenshot", { format: "png" });
  if (data) {
    const path = `${outDir}/${name}.png`;
    writeFileSync(path, Buffer.from(data, "base64"));
    console.log(`  saved ${name}.png`);
  }
};

await send("Page.enable");
await send("Runtime.enable");

await send("Page.navigate", { url });
// Give hydration, fonts and the first image time to settle.
await wait(4000);

/** Reports the opacity of every text node in a section — proves reveals ran. */
const opacities = (id) => `
  (() => {
    const s = document.getElementById(${JSON.stringify(id)});
    if (!s) return "SECTION MISSING: " + ${JSON.stringify(id)};
    return [...s.querySelectorAll("p, cite, dd, dt, h1, h2")]
      .map(e => getComputedStyle(e).opacity.padEnd(5) + " " + e.textContent.trim().slice(0, 38))
      .join("\\n");
  })()
`;

console.log("\n— invitation (scene 1) —");
console.log(await evaluate(opacities("invitation")));
await shoot("cdp-01-invitation");

for (const id of ["blessing", "gallery", "details"]) {
  await evaluate(
    `document.getElementById(${JSON.stringify(id)})?.scrollIntoView()`
  );
  // Long enough for the reveal stagger to finish.
  await wait(2600);
  console.log(`\n— ${id} —`);
  console.log(await evaluate(opacities(id)));
  await shoot(`cdp-${id}`);
}

console.log("\n— page health —");
console.log(
  await evaluate(`
  (() => {
    const d = document.documentElement;
    const over = [...document.querySelectorAll("*")]
      .filter(e => e.getBoundingClientRect().right > innerWidth + 1)
      .slice(0, 5)
      .map(e => e.tagName + "." + String(e.className).slice(0, 40));
    return [
      "viewport " + innerWidth + "x" + innerHeight,
      "scrollWidth " + d.scrollWidth + " (overflow: " + (d.scrollWidth > d.clientWidth) + ")",
      "images " + document.images.length +
        ", broken " + [...document.images].filter(i => i.complete && i.naturalWidth === 0).length,
      over.length ? "OVERFLOWING: " + over.join(", ") : "no horizontal overflow",
    ].join("\\n");
  })()
`)
);

ws.close();
