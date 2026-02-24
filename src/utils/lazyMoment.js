let cachedMoment;

export async function getMoment(locale) {
  if (!cachedMoment) {
    const mod = await import('moment');
    cachedMoment = mod.default || mod;
  }
  if (locale && locale !== 'en' && locale !== 'en-us') {
    switch (locale.toLowerCase()) {
      case 'pt-br':
        await import('moment/dist/locale/pt-br');
        break;
      case 'es':
        await import('moment/dist/locale/es');
        break;
      default:
        // Best-effort: try to load matching locale if available
        try {
          await import(`moment/dist/locale/${locale}`);
        } catch {
          // ignore if locale file not found
        }
        break;
    }
    cachedMoment.locale(locale);
  }
  return cachedMoment;
}
