import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import {
  registerUser,
  randomEmail,
  getTaskListsApi,
  getTasksApi,
  ResponseError,
  type AuthTokens,
} from '../../helpers/api.helper.ts';
import type { TaskList, Task } from 'todo-sdk';

async function createList(accessToken: string, name: string): Promise<TaskList> {
  const result = await getTaskListsApi(accessToken).taskListsControllerCreate({
    createTaskListDto: { name },
  });
  return result.data!;
}

async function createTask(
  accessToken: string,
  listId: string,
  data: { title: string; notes?: string },
): Promise<Task> {
  const result = await getTasksApi(accessToken).tasksControllerCreate({
    listId,
    createTaskDto: data,
  });
  return result.data!;
}

describe('Tasks API', () => {
  let auth: AuthTokens;
  let listId: string;
  let list2Id: string;

  before(async () => {
    auth = await registerUser(randomEmail(), 'password123');
    const list = await createList(auth.accessToken, 'Test List');
    const list2 = await createList(auth.accessToken, 'Test List 2');
    listId = list.id;
    list2Id = list2.id;
  });

  describe('POST /task-lists/:listId/tasks', () => {
    it('should create a task in a list', async () => {
      const task = await createTask(auth.accessToken, listId, {
        title: 'Buy milk',
        notes: 'Get 2%',
      });

      assert.equal(task.title, 'Buy milk');
      assert.equal(task.taskListId, listId);
      assert.equal(task.completed, false);
      assert.ok(task.id);
    });

    it('should reject task creation without title', async () => {
      try {
        await getTasksApi(auth.accessToken).tasksControllerCreate({
          listId,
          createTaskDto: { title: '' },
        });
        assert.fail('Should have thrown');
      } catch (err) {
        assert.ok(err instanceof ResponseError);
        assert.equal(err.response.status, 400);
      }
    });
  });

  describe('GET /task-lists/:listId/tasks', () => {
    it('should return tasks for a list', async () => {
      const task = await createTask(auth.accessToken, listId, { title: 'Task to list' });

      const result = await getTasksApi(auth.accessToken).tasksControllerFindAll({ listId });
      assert.ok(Array.isArray(result.data));
      const found = result.data!.find((t) => t.id === task.id);
      assert.ok(found, 'Created task should be in the list');
    });
  });

  describe('PATCH /tasks/:id', () => {
    it('should update task title', async () => {
      const task = await createTask(auth.accessToken, listId, { title: 'Original title' });

      const updated = await getTasksApi(auth.accessToken).tasksControllerUpdate({
        id: task.id,
        updateTaskDto: { title: 'Updated title' },
      });

      assert.equal(updated.data?.title, 'Updated title');
    });

    it('should mark task as completed', async () => {
      const task = await createTask(auth.accessToken, listId, { title: 'Complete me' });

      const updated = await getTasksApi(auth.accessToken).tasksControllerUpdate({
        id: task.id,
        updateTaskDto: { completed: true },
      });

      assert.equal(updated.data?.completed, true);
    });
  });

  describe('PATCH /tasks/:id/move', () => {
    it('should move task to a different list', async () => {
      const task = await createTask(auth.accessToken, listId, { title: 'Move me' });

      const moved = await getTasksApi(auth.accessToken).tasksControllerMove({
        id: task.id,
        moveTaskDto: { targetListId: list2Id },
      });

      assert.equal(moved.data?.taskListId, list2Id, 'Task should be in the target list');
    });
  });

  describe('PATCH /tasks/:id/order', () => {
    it('should update task order', async () => {
      const task = await createTask(auth.accessToken, listId, { title: 'Reorder me' });

      const updated = await getTasksApi(auth.accessToken).tasksControllerUpdateOrder({
        id: task.id,
        updateTaskOrderDto: { order: 0 },
      });

      assert.equal(updated.data?.order, 0);
    });
  });

  describe('DELETE /tasks/:id', () => {
    it('should delete a task', async () => {
      const task = await createTask(auth.accessToken, listId, { title: 'Delete me' });

      await getTasksApi(auth.accessToken).tasksControllerDelete({ id: task.id });

      // Verify it's gone
      const result = await getTasksApi(auth.accessToken).tasksControllerFindAll({ listId });
      const found = result.data?.find((t) => t.id === task.id);
      assert.equal(found, undefined, 'Deleted task should not be in the list');
    });
  });
});
