/**
 * Guards against stale design tokens.
 *
 * Tailwind silently emits nothing for an unknown utility, so a renamed token
 * leaves the markup looking correct while the styling quietly disappears.
 * (This is exactly how the welcome overlay lost its background: it kept
 * `bg-ivory` after the colour was renamed to `surface`.)
 *
 * Run in CI or before a deploy:  node scripts/check-tokens.mjs
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";

/** Class names that no longer exist, mapped to their replacement. */
const RETIRED = {
  "bg-ivory": "bg-surface",
  "bg-cream": "bg-surface-alt",
  "text-charcoal": "text-ink",
  "text-gold": "text-accent (decorative) / text-accent-strong (text)",
  "border-gold": "border-accent",
  "bg-gold": "bg-accent",
  "text-divider": "text-line",
  "bg-divider": "bg-line",
  eyebrow: "t-eyebrow",
  whisper: "t-whisper",
  "detail-label": "t-label",
  "detail-value": "t-value",
  "invite-body": "t-body",
  "child-name": "t-name",
  "scripture-line": "t-scripture",
  "gold-rule": "rule",
  "tap-target": "tap",
  "motion-safe-fade": "allow-fade",
};

/** Utilities whose values must come from the scale, not arbitrary literals. */
const ARBITRARY = /\b(?:m|p)(?:[trblxy])?-\[|(?:gap|w|h|text|z|max-w|min-h|min-w|rounded|border)-\[/;

const ROOTS = ["app", "components", "data", "lib"];
const problems = [];

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) {
      walk(path);
    } else if ([".tsx", ".ts", ".css"].includes(extname(path))) {
      inspect(path);
    }
  }
}

function inspect(path) {
  const lines = readFileSync(path, "utf8").split("\n");

  lines.forEach((line, index) => {
    // Skip comment lines — retired names are referenced in explanations.
    const trimmed = line.trim();
    if (
      trimmed.startsWith("*") ||
      trimmed.startsWith("//") ||
      trimmed.startsWith("/*")
    ) {
      return;
    }

    for (const [stale, replacement] of Object.entries(RETIRED)) {
      // Match only inside a class string, on a word boundary.
      const pattern = new RegExp(`["'\\s]${stale}(?=["'\\s])`);
      if (pattern.test(line)) {
        problems.push(
          `${path}:${index + 1}  retired "${stale}" → use "${replacement}"`
        );
      }
    }

    // Arbitrary values are allowed in globals.css and the config, where the
    // scale itself is defined, and for genuinely fluid viewport expressions.
    if (
      !path.endsWith("globals.css") &&
      !path.includes("tailwind.config") &&
      ARBITRARY.test(line) &&
      !line.includes("svh") &&
      !line.includes("min(")
    ) {
      problems.push(
        `${path}:${index + 1}  arbitrary value — add a token instead:\n      ${trimmed.slice(0, 100)}`
      );
    }
  });
}

ROOTS.forEach((root) => {
  try {
    walk(root);
  } catch {
    /* root may not exist */
  }
});

if (problems.length > 0) {
  console.error(`\n✗ ${problems.length} design-token problem(s):\n`);
  problems.forEach((problem) => console.error(`  ${problem}`));
  console.error("");
  process.exit(1);
}

console.log("✓ No stale or arbitrary design tokens found.");
