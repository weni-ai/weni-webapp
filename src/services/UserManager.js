import { UserManager } from 'oidc-client';

export default class extends UserManager {
  get _userStoreKey() {
    return `${super._userStoreKey}`;
  }
}
