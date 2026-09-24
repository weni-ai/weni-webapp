import { describe, expect, it } from 'vitest';
import en from '@/locales/en.json';
import es from '@/locales/es.json';
import ptBr from '@/locales/pt_br.json';
import ro from '@/locales/ro.json';

const LOCALES = { en, pt_br: ptBr, es, ro };

// Capture `{name}` and the ICU argument in `{count, plural|select, …}`.
// A following `,` or `}` is required so branch bodies like `{in {count} day}`
// are not treated as a placeholder named `in`.
const PLACEHOLDER_NAME_PATTERN = /\{([A-Za-z_][\w]*)\s*(?:,|\})/g;

function placeholderNames(message) {
  if (typeof message !== 'string') {
    return [];
  }

  return [
    ...new Set(
      [...message.matchAll(PLACEHOLDER_NAME_PATTERN)].map((match) => match[1]),
    ),
  ].sort();
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function assertOrderedKeySequence(reference, actual, locale, path = 'root') {
  expect(Object.keys(actual), `${locale} key sequence at ${path}`).toEqual(
    Object.keys(reference),
  );

  Object.keys(reference).forEach((key) => {
    const childPath = path === 'root' ? key : `${path}.${key}`;
    const referenceValue = reference[key];
    const actualValue = actual[key];

    if (isPlainObject(referenceValue) || isPlainObject(actualValue)) {
      expect(
        isPlainObject(actualValue),
        `${locale} structure at ${childPath}`,
      ).toBe(true);
      assertOrderedKeySequence(referenceValue, actualValue, locale, childPath);
    }
  });
}

function assertPlaceholderParity(reference, actual, locale, path = 'root') {
  if (isPlainObject(reference) && isPlainObject(actual)) {
    Object.keys(reference).forEach((key) => {
      const childPath = path === 'root' ? key : `${path}.${key}`;
      assertPlaceholderParity(reference[key], actual[key], locale, childPath);
    });
    return;
  }

  if (typeof reference !== 'string' || typeof actual !== 'string') {
    return;
  }

  expect(placeholderNames(actual), `${locale} placeholders at ${path}`).toEqual(
    placeholderNames(reference),
  );
}

describe('locale parity', () => {
  const localesToCompare = Object.entries(LOCALES).filter(
    ([name]) => name !== 'en',
  );

  it('has an identical ordered key sequence at every nesting level', () => {
    localesToCompare.forEach(([name, tree]) => {
      assertOrderedKeySequence(en, tree, name);
    });
  });

  it('has an identical placeholder-name set for every leaf key', () => {
    localesToCompare.forEach(([name, tree]) => {
      assertPlaceholderParity(en, tree, name);
    });
  });

  it("treats vue-i18n literal escape {'@'} as an empty placeholder set", () => {
    expect(en.orgs.sso.invalid_domain).toBe(
      "Enter a domain without {'@'} (example: yourcompany.com)",
    );
    expect(placeholderNames(en.orgs.sso.invalid_domain)).toEqual([]);
  });
});
