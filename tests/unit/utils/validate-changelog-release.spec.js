import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const {
  isValidDate,
  parseLatestChangelogEntry,
  validateChangelogRelease,
} = require('../../../scripts/validate-changelog-release.js');

const VALID_CHANGELOG = `# Change Log

## [2.35.0] - 2026-06-18

### Added

- feat: example change
`;

describe('isValidDate', () => {
  it('accepts valid calendar dates', () => {
    expect(isValidDate('2026-06-18')).toBe(true);
  });

  it('rejects invalid calendar dates', () => {
    expect(isValidDate('2026-02-30')).toBe(false);
  });
});

describe('parseLatestChangelogEntry', () => {
  it('parses the top changelog entry with bullets', () => {
    expect(parseLatestChangelogEntry(VALID_CHANGELOG)).toEqual({
      version: '2.35.0',
      date: '2026-06-18',
    });
  });

  it('fails when no version header exists', () => {
    expect(parseLatestChangelogEntry('# Change Log\n')).toEqual({
      error: 'No version entry found in CHANGELOG.md',
    });
  });

  it('fails when the header format is invalid', () => {
    expect(parseLatestChangelogEntry('# Change Log\n\n## 2.35.0\n')).toEqual({
      error: 'No version entry found in CHANGELOG.md',
    });
  });

  it('fails when the release section has no bullets', () => {
    const changelog = `# Change Log

## [2.35.0] - 2026-06-18

### Added
`;

    expect(parseLatestChangelogEntry(changelog)).toEqual({
      error:
        'CHANGELOG [2.35.0] has no entries under Added/Changed/Fixed/Removed',
    });
  });

  it('fails when bullets are outside recognized sections', () => {
    const changelog = `# Change Log

## [2.35.0] - 2026-06-18

- feat: orphan bullet
`;

    expect(parseLatestChangelogEntry(changelog)).toEqual({
      error:
        'CHANGELOG [2.35.0] has a bullet outside Added/Changed/Fixed/Removed sections',
    });
  });

  it('fails when the date is invalid', () => {
    const changelog = `# Change Log

## [2.35.0] - 2026-02-30

### Fixed

- fix: example
`;

    expect(parseLatestChangelogEntry(changelog)).toEqual({
      error: 'Invalid date "2026-02-30" in CHANGELOG entry [2.35.0]',
    });
  });
});

describe('validateChangelogRelease', () => {
  it('passes when the tag matches the top changelog entry', () => {
    expect(validateChangelogRelease(VALID_CHANGELOG, '2.35.0')).toBeNull();
  });

  it('fails when the tag does not match the top changelog entry', () => {
    expect(validateChangelogRelease(VALID_CHANGELOG, '2.34.0')).toBe(
      'Tag 2.34.0 does not match latest CHANGELOG entry [2.35.0]',
    );
  });

  it('fails when the version format is invalid', () => {
    expect(validateChangelogRelease(VALID_CHANGELOG, 'v2.35.0')).toBe(
      'Invalid version format "v2.35.0"; expected X.Y.Z',
    );
  });
});
