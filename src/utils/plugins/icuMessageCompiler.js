import IntlMessageFormat from 'intl-messageformat';
import { compile as compileNative } from '@intlify/core-base';

/**
 * Matches real ICU blocks only: {var, plural|selectordinal, { … }
 * or {var, select, { … }. Avoids false positives like
 * "{user, select another option}" or "{item, plural forms available}".
 */
const ICU_PLURAL_OR_SELECTORDINAL_PATTERN =
  /\{([a-zA-Z][\w]*),\s*(?:plural|selectordinal)\s*,\s*(?:(?:=\d+)|zero|one|two|few|many|other)\s*\{/i;

const ICU_SELECT_PATTERN = /\{([a-zA-Z][\w]*),\s*select\s*,\s*[\w#.-]+\s*\{/i;

/** Tag names in ICU XML markup (<b>, <i>, <br>) need function handlers in .format(). */
const ICU_XML_TAG_PATTERN = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b/g;

export function shouldUseIntlMessageFormat(message) {
  return (
    ICU_PLURAL_OR_SELECTORDINAL_PATTERN.test(message) ||
    ICU_SELECT_PATTERN.test(message)
  );
}

function createDefaultTagHandler(tagName) {
  if (tagName === 'br') {
    return (chunks) => chunks.join('') + ' ';
  }

  return (chunks) => {
    const content = chunks.join('');
    return `<${tagName}>${content}</${tagName}>`;
  };
}

/**
 * Merges $t params with default ICU tag handlers so plural + HTML works without
 * passing b/i/br manually on every call.
 */
function buildIntlFormatValues(message, values = {}) {
  const formatValues = { ...(values || {}) };
  let match;

  while ((match = ICU_XML_TAG_PATTERN.exec(message)) !== null) {
    const tagName = match[1];
    const existing = formatValues[tagName];

    if (typeof existing === 'function') {
      continue;
    }

    formatValues[tagName] = createDefaultTagHandler(tagName);
  }

  ICU_XML_TAG_PATTERN.lastIndex = 0;
  return formatValues;
}

/**
 * Vue I18n custom messageCompiler.
 * ICU plural/select messages are rendered through IntlMessageFormat so the host
 * can display the ICU pattern emitted by migrated remotes and the own migrated locales.
 * Every other message (plain `{var}` interpolation, linked messages, HTML, and
 * the not-yet-migrated insights remote) is delegated to vue-i18n's native
 * compiler so existing behavior is preserved.
 */
export const icuMessageCompiler = (message, context) => {
  if (typeof message === 'string' && shouldUseIntlMessageFormat(message)) {
    const formatter = new IntlMessageFormat(message, context.locale);
    return (ctx) => {
      const formatted = formatter.format(
        buildIntlFormatValues(message, ctx.values),
      );
      const parts = Array.isArray(formatted) ? formatted : [formatted];
      return ctx.normalize(parts);
    };
  }

  return compileNative(message, context);
};
