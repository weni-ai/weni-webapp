import { reactive } from 'vue';
import { configureCache, GrowthBook } from '@growthbook/growthbook';
import globalStore from '@/store';
import getEnv from '@/utils/env';

const gbKey = Symbol('growthbook');

const createGrowthBookInstance = () => {
  return reactive(
    new GrowthBook({
      apiHost: getEnv('GROWTHBOOK_API_HOST'),
      clientKey: getEnv('GROWTHBOOK_CLIENT_KEY'),
      attributes: {
        email: globalStore?.state?.Account?.profile?.email || '',
        weni_project: globalStore?.state?.Project?.currentProject?.uuid || '',
        weni_org: globalStore?.state?.Org?.currentOrg?.uuid || '',
      },
    }),
  );
};

configureCache({
  cacheKey: 'gbFeaturesCache',
  maxAge: 2000 * 60 * 60 * 0.5, // 2 hours
});

const gbInstance = createGrowthBookInstance();

const initializeGrowthBook = async () => {
  if (!getEnv('GROWTHBOOK_API_HOST') || !getEnv('GROWTHBOOK_CLIENT_KEY')) {
    console.warn('GrowthBook configuration missing, using fallback instance');
    return gbInstance;
  }

  try {
    await gbInstance.init();
    return gbInstance;
  } catch (e) {
    console.error('Error initializing GrowthBook, using fallback instance:', e);
    return gbInstance;
  }
};

const getGrowthBook = () => {
  return gbInstance;
};

const updateGrowthBookAttributes = (attributes) => {
  if (gbInstance) {
    gbInstance.setAttributes({
      ...gbInstance.getAttributes(),
      ...attributes,
    });
  }
};

export {
  gbKey,
  gbInstance,
  initializeGrowthBook,
  getGrowthBook,
  updateGrowthBookAttributes,
};
