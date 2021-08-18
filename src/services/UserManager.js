import { UserManager } from 'oidc-client';

export default class extends UserManager {
  get _userStoreKey() {
    return `${super._userStoreKey}:${process.env.VUE_APP_HASH}-${
      process.env.VUE_APP_PACKAGE_VERSION
    }`;
  }
}
