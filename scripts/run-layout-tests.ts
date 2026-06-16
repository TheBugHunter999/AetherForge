/**
 * Layout solver unit tests.
 * Run: npx tsx scripts/run-layout-tests.ts
 */
import { runLayoutTests } from "../src/lib/layout/layout.test.ts";

const results = runLayoutTests();
let failed = 0;

for (const { name, ok, detail } of results) {
  if (ok) {
    console.log(`✓ ${name}`);
  } else {
    failed++;
    console.error(`✗ ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

console.log(`\n${results.length - failed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);