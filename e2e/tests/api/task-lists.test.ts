import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import {
  registerUser,
  randomEmail,
  getTaskListsApi,
  ResponseError,
  type AuthTokens,
} from '../../helpers/api.helper.ts';

describe('Task Lists API', () => {
  let auth: AuthTokens;
  let otherAuth: AuthTokens;

  before(async () => {
    auth = await registerUser(randomEmail(), 'password123');
    otherAuth = await registerUser(randomEmail(), 'password123');
  });

  describe('GET /task-lists', () => {
    it('should return empty array for new user', async () => {
      const result = await getTaskListsApi(auth.accessToken).taskListsControllerFindAll();
      assert.ok(Array.isArray(result.data), 'Should return an array');
    });
  });

  describe('POST /task-lists', () => {
    it('should create a new task list', async () => {
      const result = await getTaskListsApi(auth.accessToken).taskListsControllerCreate({
        createTaskListDto: { name: 'My Tasks' },
      });

      assert.equal(result.data?.name, 'My Tasks');
      assert.equal(result.data?.userId, auth.userId);
      assert.ok(result.data?.id);
    });

    it('should reject list creation without auth', async () => {
      try {
        await getTaskListsApi('').taskListsControllerCreate({
          createTaskListDto: { name: 'My Tasks' },
        });
        assert.fail('Should have thrown');
      } catch (err) {
        assert.ok(err instanceof ResponseError);
        assert.equal(err.response.status, 401);
      }
    });
  });

  describe('PATCH /task-lists/:id', () => {
    it('should update task list name', async () => {
      const api = getTaskListsApi(auth.accessToken);
      const created = await api.taskListsControllerCreate({
        createTaskListDto: { name: 'Old Name' },
      });
      const listId = created.data!.id;

      const updated = await api.taskListsControllerUpdate({
        id: listId,
        updateTaskListDto: { name: 'New Name' },
      });

      assert.equal(updated.data?.name, 'New Name');
    });

    it('should reject update from different user', async () => {
      const api = getTaskListsApi(auth.accessToken);
      const created = await api.taskListsControllerCreate({
        createTaskListDto: { name: 'My List' },
      });
      const listId = created.data!.id;

      try {
        await getTaskListsApi(otherAuth.accessToken).taskListsControllerUpdate({
          id: listId,
          updateTaskListDto: { name: 'Stolen Name' },
        });
        assert.fail('Should have thrown');
      } catch (err) {
        assert.ok(err instanceof ResponseError);
        assert.equal(err.response.status, 403, 'Should return 403 for unauthorized update');
      }
    });
  });

  describe('DELETE /task-lists/:id', () => {
    it('should delete a task list', async () => {
      const api = getTaskListsApi(auth.accessToken);
      const created = await api.taskListsControllerCreate({
        createTaskListDto: { name: 'To Delete' },
      });
      const listId = created.data!.id;

      await api.taskListsControllerDelete({ id: listId }); // should resolve without error
    });

    it('should reject deletion from different user', async () => {
      const api = getTaskListsApi(auth.accessToken);
      const created = await api.taskListsControllerCreate({
        createTaskListDto: { name: 'My Protected List' },
      });
      const listId = created.data!.id;

      try {
        await getTaskListsApi(otherAuth.accessToken).taskListsControllerDelete({ id: listId });
        assert.fail('Should have thrown');
      } catch (err) {
        assert.ok(err instanceof ResponseError);
        assert.equal(err.response.status, 403);
      }
    });
  });
});
