import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  registerUser,
  loginUser,
  randomEmail,
  getAuthApi,
  getTaskListsApi,
  ResponseError,
} from '../../helpers/api.helper.ts';

describe('Auth API', () => {
  describe('POST /auth/register', () => {
    it('should register a new user and return access token', async () => {
      const email = randomEmail();
      const result = await registerUser(email, 'password123');

      assert.ok(result.accessToken, 'Should return an access token');
      assert.equal(result.email, email, 'Should return the registered email');
      assert.ok(result.userId, 'Should return a user ID');
    });

    it('should reject duplicate email registration', async () => {
      const email = randomEmail();
      await registerUser(email, 'password123');

      try {
        await registerUser(email, 'password123');
        assert.fail('Should have thrown');
      } catch (err) {
        assert.ok(err instanceof ResponseError, 'Should be a ResponseError');
        assert.equal(err.response.status, 409, 'Should return 409 Conflict for duplicate email');
      }
    });

    it('should reject invalid email format', async () => {
      try {
        await getAuthApi().authControllerRegister({
          registerDto: { email: 'not-an-email', password: 'password123' },
        });
        assert.fail('Should have thrown');
      } catch (err) {
        assert.ok(err instanceof ResponseError);
        assert.equal(err.response.status, 400, 'Should return 400 for invalid email');
      }
    });

    it('should reject short passwords', async () => {
      try {
        await getAuthApi().authControllerRegister({
          registerDto: { email: randomEmail(), password: 'short' },
        });
        assert.fail('Should have thrown');
      } catch (err) {
        assert.ok(err instanceof ResponseError);
        assert.equal(err.response.status, 400, 'Should return 400 for short password');
      }
    });
  });

  describe('POST /auth/login', () => {
    it('should login with correct credentials', async () => {
      const email = randomEmail();
      const password = 'mypassword123';
      await registerUser(email, password);

      const result = await loginUser(email, password);
      assert.ok(result.accessToken, 'Should return an access token on login');
      assert.equal(result.email, email);
    });

    it('should reject wrong password', async () => {
      const email = randomEmail();
      await registerUser(email, 'correctpassword');

      try {
        await loginUser(email, 'wrongpassword');
        assert.fail('Should have thrown');
      } catch (err) {
        assert.ok(err instanceof ResponseError);
        assert.equal(err.response.status, 401, 'Should return 401 for wrong password');
      }
    });

    it('should reject non-existent user', async () => {
      try {
        await loginUser('nonexistent@test.com', 'password123');
        assert.fail('Should have thrown');
      } catch (err) {
        assert.ok(err instanceof ResponseError);
        assert.equal(err.response.status, 401, 'Should return 401 for non-existent user');
      }
    });

    it('should reject requests without auth token on protected routes', async () => {
      try {
        await getTaskListsApi('').taskListsControllerFindAll();
        assert.fail('Should have thrown');
      } catch (err) {
        assert.ok(err instanceof ResponseError);
        assert.equal(err.response.status, 401, 'Should return 401 when no token provided');
      }
    });

    it('should reject requests with invalid auth token', async () => {
      try {
        await getTaskListsApi('invalid.token.here').taskListsControllerFindAll();
        assert.fail('Should have thrown');
      } catch (err) {
        assert.ok(err instanceof ResponseError);
        assert.equal(err.response.status, 401, 'Should return 401 for invalid token');
      }
    });
  });
});
