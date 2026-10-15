// Local QA: axe (WCAG 2.1 AA), console errors, images load, interactive branches, mobile overflow, screenshots.
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import http from "node:http";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";

const root = new URL("..", import.meta.url).pathname;
const types = { ".html": "text/html; charset=utf-8", ".webp": "image/webp", ".txt": "text/plain" };
const srv = http.createServer((req, res) => {
  const p = path.join(root, decodeURIComponent(req.url.split("?")[0]) === "/" ? "index.html" : decodeURIComponent(req.url.split("?")[0]));
  if (!existsSync(p)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { "content-type": types[path.extname(p)] || "application/octet-stream" }); res.end(readFileSync(p));
}).listen(4321);

const browser = await chromium.launch();
const out = {};
for (const [name, vp] of [["desktop", { width: 1366, height: 900 }], ["mobile", { width: 375, height: 812 }]]) {
  const ctx = await browser.newContext({ viewport: vp, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  const errors = [];
  page.on("console", (m) => m.type() === "error" && !/fonts\.g|ERR_TUNNEL/.test(m.text()) && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto("http://localhost:4321/", { waitUntil: "load" });
  const ax = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  const imgs = await page.evaluate(async () => {
    const list = [...document.images]; for (const i of list) { i.loading = "eager"; await i.decode().catch(() => {}); }
    return list.map((i) => ({ src: i.getAttribute("src"), ok: i.naturalWidth > 0 }));
  });
  // branch buttons
  await page.getByRole("button", { name: "פחות מ-6 חודשים" }).click();
  const shortVisible = await page.locator('[data-branch="short"]').isVisible();
  const longHidden = !(await page.locator('[data-branch="long"]').isVisible());
  for (const id of ["a1", "a2", "b1", "b4"]) {
    await page.locator("#" + id).screenshot({ path: `test/${name}-${id}.png` });
  }
  await page.screenshot({ path: `test/${name}-top.png` });
  out[name] = {
    axe: ax.violations.map((v) => `${v.impact} ${v.id} (${v.nodes.length}): ${v.nodes[0]?.target}`),
    errors, overflow, imagesBroken: imgs.filter((i) => !i.ok).map((i) => i.src), images: imgs.length,
    branchToggle: shortVisible && longHidden,
  };
}
console.log(JSON.stringify(out, null, 2));
await browser.close(); srv.close();
