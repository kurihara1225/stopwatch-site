import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the stopwatch's initial state", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<html lang="ja">/i);
  assert.match(html, /<title>Minute \/ Moment — ストップウォッチ<\/title>/i);
  assert.match(html, /<main class="page-shell">/);
  assert.match(html, /aria-label="ストップウォッチ"/);
  assert.match(html, /<span>00:00<\/span>/);
  assert.match(html, /待機中/);
  assert.match(html, /スタート/);
  assert.match(html, /ラップタイム/);
  assert.doesNotMatch(html, /Your site is taking shape|Building your site/);
});

test("keeps the stopwatch implementation and metadata in their app modules", async () => {
  const [page, layout, css] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.match(page, /^"use client";/);
  assert.match(page, /function formatTime\(milliseconds: number\)/);
  assert.match(page, /window\.setInterval\(tick, 10\)/);
  assert.match(page, /const toggle = \(\) =>/);
  assert.match(page, /const reset = \(\) =>/);
  assert.match(page, /const recordLap = \(\) =>/);
  assert.match(page, /aria-live="polite"/);
  assert.match(page, /disabled=\{!running\}/);
  assert.match(page, /laps\.map\(\(lap, index\) =>/);

  assert.match(layout, /export async function generateMetadata/);
  assert.match(layout, /title = "Minute \/ Moment — ストップウォッチ"/);
  assert.match(layout, /icons: \{ icon: "\/favicon\.svg"/);
  assert.match(layout, /openGraph:/);
  assert.match(layout, /twitter:/);

  assert.match(css, /\.stopwatch\s*\{/);
  assert.match(css, /\.controls\s*\{/);
  assert.match(css, /@media\s*\(max-width:/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.doesNotMatch(page, /SkeletonPreview|react-loading-skeleton/);
});
