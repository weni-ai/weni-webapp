/* eslint-disable no-console */
/**
 * Validates that CHANGELOG.md is ready for a production release.
 *
 * Usage:
 *   node scripts/validate-changelog-release.js --version 2.35.0
 */

const fs = require('fs');
const path = require('path');

const VERSION_HEADER = /^## \[(\d+\.\d+\.\d+)\] - (\d{4}-\d{2}-\d{2})\s*$/;
const SECTION_HEADER = /^### (Added|Changed|Fixed|Removed)\s*$/;
const VALID_SECTIONS = new Set(['Added', 'Changed', 'Fixed', 'Removed']);
const SEMVER_PATTERN = /^\d+\.\d+\.\d+$/;

const CHANGELOG_PATH = path.join(__dirname, '..', 'CHANGELOG.md');

function isValidDate(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function parseLatestChangelogEntry(content) {
  const lines = content.split('\n');
  let versionLineIndex = -1;
  let version = null;
  let date = null;

  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(VERSION_HEADER);

    if (match) {
      versionLineIndex = i;
      version = match[1];
      date = match[2];
      break;
    }
  }

  if (versionLineIndex === -1) {
    return { error: 'No version entry found in CHANGELOG.md' };
  }

  if (!isValidDate(date)) {
    return { error: `Invalid date "${date}" in CHANGELOG entry [${version}]` };
  }

  let currentSection = null;
  let hasBulletInValidSection = false;

  for (let i = versionLineIndex + 1; i < lines.length; i++) {
    const line = lines[i];

    if (line.match(/^## \[/)) {
      break;
    }

    const sectionMatch = line.match(SECTION_HEADER);

    if (sectionMatch) {
      currentSection = sectionMatch[1];
      continue;
    }

    if (line.startsWith('- ') && line.slice(2).trim()) {
      if (!currentSection) {
        return {
          error: `CHANGELOG [${version}] has a bullet outside Added/Changed/Fixed/Removed sections`,
        };
      }

      if (!VALID_SECTIONS.has(currentSection)) {
        return {
          error: `CHANGELOG [${version}] has entries under unrecognized section "${currentSection}"`,
        };
      }

      hasBulletInValidSection = true;
    }
  }

  if (!hasBulletInValidSection) {
    return {
      error: `CHANGELOG [${version}] has no entries under Added/Changed/Fixed/Removed`,
    };
  }

  return { version, date };
}

function validateChangelogRelease(content, expectedVersion) {
  if (!SEMVER_PATTERN.test(expectedVersion)) {
    return `Invalid version format "${expectedVersion}"; expected X.Y.Z`;
  }

  const entry = parseLatestChangelogEntry(content);

  if (entry.error) {
    return entry.error;
  }

  if (entry.version !== expectedVersion) {
    return `Tag ${expectedVersion} does not match latest CHANGELOG entry [${entry.version}]`;
  }

  return null;
}

function main() {
  const args = process.argv.slice(2);
  const versionIndex = args.indexOf('--version');

  if (versionIndex === -1 || !args[versionIndex + 1]) {
    console.error(
      'Usage: node scripts/validate-changelog-release.js --version X.Y.Z',
    );
    process.exit(1);
  }

  const expectedVersion = args[versionIndex + 1];
  const content = fs.readFileSync(CHANGELOG_PATH, 'utf8');
  const error = validateChangelogRelease(content, expectedVersion);

  if (error) {
    console.error(error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  isValidDate,
  parseLatestChangelogEntry,
  validateChangelogRelease,
};
