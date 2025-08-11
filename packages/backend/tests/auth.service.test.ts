/* eslint-env jest */
import { AuthService } from '../src/modules/auth/service';

describe('AuthService token generation', () => {
  const svc = new AuthService();
  it('generates access & refresh tokens', () => {
    // @ts-ignore accessing private for test
    const tokens = svc['generateTokens']('user123','READER');
    expect(tokens).toHaveProperty('accessToken');
    expect(tokens).toHaveProperty('refreshToken');
  });
});
