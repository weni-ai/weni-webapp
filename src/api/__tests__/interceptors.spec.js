import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import {
  attachAuthorizationHeader,
  attachSessionExpirationHandler,
} from '@/api/interceptors';

const { keycloakService } = vi.hoisted(() => ({
  keycloakService: {
    keycloak: {
      token: undefined,
      logout: vi.fn(),
    },
  },
}));

vi.mock('@/services/Keycloak', () => ({ default: keycloakService }));

function createInstance({ failWith } = {}) {
  const instance = axios.create();
  const sentRequests = [];

  instance.defaults.adapter = async (config) => {
    sentRequests.push(config);

    if (failWith) {
      const error = new Error('Request failed');
      error.config = config;
      error.response = failWith;
      throw error;
    }

    return { data: {}, status: 200, statusText: 'OK', headers: {}, config };
  };

  return { instance, sentRequests };
}

describe('attachAuthorizationHeader', () => {
  beforeEach(() => {
    keycloakService.keycloak.token = undefined;
  });

  it('should send the current Keycloak token as a bearer credential', async () => {
    keycloakService.keycloak.token = 'a-valid-token';

    const { instance, sentRequests } = createInstance();
    attachAuthorizationHeader(instance);

    await instance.get('/anything');

    expect(sentRequests[0].headers.Authorization).toBe('Bearer a-valid-token');
  });

  it('should omit the header entirely when there is no token', async () => {
    const { instance, sentRequests } = createInstance();
    attachAuthorizationHeader(instance);

    await instance.get('/anything');

    expect(sentRequests[0].headers.Authorization).toBeUndefined();
  });

  it('should read the token on every request instead of caching it', async () => {
    const { instance, sentRequests } = createInstance();
    attachAuthorizationHeader(instance);

    await instance.get('/anything');
    keycloakService.keycloak.token = 'refreshed-token';
    await instance.get('/anything');

    expect(sentRequests[0].headers.Authorization).toBeUndefined();
    expect(sentRequests[1].headers.Authorization).toBe(
      'Bearer refreshed-token',
    );
  });
});

describe('attachSessionExpirationHandler', () => {
  beforeEach(() => {
    keycloakService.keycloak.token = 'a-valid-token';
    keycloakService.keycloak.logout.mockClear();
  });

  function createHandledInstance(failWith) {
    const { instance } = createInstance({ failWith });

    attachAuthorizationHeader(instance);
    attachSessionExpirationHandler(instance);

    return instance;
  }

  it('should pass successful responses through untouched', async () => {
    const instance = createHandledInstance();

    const response = await instance.get('/anything');

    expect(response.status).toBe(200);
    expect(keycloakService.keycloak.logout).not.toHaveBeenCalled();
  });

  it('should log the user out when an authenticated request is rejected with 401', async () => {
    const instance = createHandledInstance({ status: 401, data: {} });

    await expect(instance.get('/anything')).rejects.toThrow('Request failed');

    expect(keycloakService.keycloak.logout).toHaveBeenCalledTimes(1);
  });

  it.each([
    "User session not found or doesn't have client attached on it",
    'Session expired',
  ])('should log the user out when the backend answers "%s"', async (detail) => {
    const instance = createHandledInstance({ status: 403, data: { detail } });

    await expect(instance.get('/anything')).rejects.toThrow('Request failed');

    expect(keycloakService.keycloak.logout).toHaveBeenCalledTimes(1);
  });

  it('should not log the user out when the rejected request carried no token', async () => {
    keycloakService.keycloak.token = undefined;

    const instance = createHandledInstance({ status: 401, data: {} });

    await expect(instance.get('/anything')).rejects.toThrow('Request failed');

    expect(keycloakService.keycloak.logout).not.toHaveBeenCalled();
  });

  it('should not log the user out on errors unrelated to the session', async () => {
    const instance = createHandledInstance({ status: 500, data: {} });

    await expect(instance.get('/anything')).rejects.toThrow('Request failed');

    expect(keycloakService.keycloak.logout).not.toHaveBeenCalled();
  });
});
