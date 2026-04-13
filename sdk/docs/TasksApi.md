# TasksApi

All URIs are relative to _http://localhost_

| Method                                                                   | HTTP request                        | Description                       |
| ------------------------------------------------------------------------ | ----------------------------------- | --------------------------------- |
| [**tasksControllerCreate**](TasksApi.md#taskscontrollercreate)           | **POST** /task-lists/{listId}/tasks | Create a new task in a list       |
| [**tasksControllerDelete**](TasksApi.md#taskscontrollerdelete)           | **DELETE** /tasks/{id}              | Delete a task                     |
| [**tasksControllerFindAll**](TasksApi.md#taskscontrollerfindall)         | **GET** /task-lists/{listId}/tasks  | Get all tasks for a task list     |
| [**tasksControllerMove**](TasksApi.md#taskscontrollermove)               | **PATCH** /tasks/{id}/move          | Move a task to a different list   |
| [**tasksControllerUpdate**](TasksApi.md#taskscontrollerupdate)           | **PATCH** /tasks/{id}               | Update a task                     |
| [**tasksControllerUpdateOrder**](TasksApi.md#taskscontrollerupdateorder) | **PATCH** /tasks/{id}/order         | Update task order within its list |

## tasksControllerCreate

> TasksControllerCreate201Response tasksControllerCreate(listId, createTaskDto)

Create a new task in a list

### Example

```ts
import { Configuration, TasksApi } from 'todo-sdk';
import type { TasksControllerCreateRequest } from 'todo-sdk';

async function example() {
  console.log('🚀 Testing  SDK...');
  const config = new Configuration({
    // Configure HTTP bearer authorization: bearer
    accessToken: 'YOUR BEARER TOKEN',
  });
  const api = new TasksApi(config);

  const body = {
    // string
    listId: listId_example,
    // CreateTaskDto
    createTaskDto: { title: 'Buy groceries' },
  } satisfies TasksControllerCreateRequest;

  try {
    const data = await api.tasksControllerCreate(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name              | Type                              | Description | Notes                     |
| ----------------- | --------------------------------- | ----------- | ------------------------- |
| **listId**        | `string`                          |             | [Defaults to `undefined`] |
| **createTaskDto** | [CreateTaskDto](CreateTaskDto.md) |             |                           |

### Return type

[**TasksControllerCreate201Response**](TasksControllerCreate201Response.md)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`

### HTTP response details

| Status code | Description | Response headers |
| ----------- | ----------- | ---------------- |
| **201**     |             | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## tasksControllerDelete

> tasksControllerDelete(id)

Delete a task

### Example

```ts
import { Configuration, TasksApi } from 'todo-sdk';
import type { TasksControllerDeleteRequest } from 'todo-sdk';

async function example() {
  console.log('🚀 Testing  SDK...');
  const config = new Configuration({
    // Configure HTTP bearer authorization: bearer
    accessToken: 'YOUR BEARER TOKEN',
  });
  const api = new TasksApi(config);

  const body = {
    // string
    id: id_example,
  } satisfies TasksControllerDeleteRequest;

  try {
    const data = await api.tasksControllerDelete(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name   | Type     | Description | Notes                     |
| ------ | -------- | ----------- | ------------------------- |
| **id** | `string` |             | [Defaults to `undefined`] |

### Return type

`void` (Empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined

### HTTP response details

| Status code | Description | Response headers |
| ----------- | ----------- | ---------------- |
| **204**     |             | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## tasksControllerFindAll

> TasksControllerFindAll200Response tasksControllerFindAll(listId)

Get all tasks for a task list

### Example

```ts
import { Configuration, TasksApi } from 'todo-sdk';
import type { TasksControllerFindAllRequest } from 'todo-sdk';

async function example() {
  console.log('🚀 Testing  SDK...');
  const config = new Configuration({
    // Configure HTTP bearer authorization: bearer
    accessToken: 'YOUR BEARER TOKEN',
  });
  const api = new TasksApi(config);

  const body = {
    // string
    listId: listId_example,
  } satisfies TasksControllerFindAllRequest;

  try {
    const data = await api.tasksControllerFindAll(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name       | Type     | Description | Notes                     |
| ---------- | -------- | ----------- | ------------------------- |
| **listId** | `string` |             | [Defaults to `undefined`] |

### Return type

[**TasksControllerFindAll200Response**](TasksControllerFindAll200Response.md)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

### HTTP response details

| Status code | Description | Response headers |
| ----------- | ----------- | ---------------- |
| **200**     |             | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## tasksControllerMove

> TasksControllerCreate201Response tasksControllerMove(id, moveTaskDto)

Move a task to a different list

### Example

```ts
import { Configuration, TasksApi } from 'todo-sdk';
import type { TasksControllerMoveRequest } from 'todo-sdk';

async function example() {
  console.log('🚀 Testing  SDK...');
  const config = new Configuration({
    // Configure HTTP bearer authorization: bearer
    accessToken: 'YOUR BEARER TOKEN',
  });
  const api = new TasksApi(config);

  const body = {
    // string
    id: id_example,
    // MoveTaskDto
    moveTaskDto: { targetListId: '550e8400-e29b-41d4-a716-446655440000' },
  } satisfies TasksControllerMoveRequest;

  try {
    const data = await api.tasksControllerMove(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name            | Type                          | Description | Notes                     |
| --------------- | ----------------------------- | ----------- | ------------------------- |
| **id**          | `string`                      |             | [Defaults to `undefined`] |
| **moveTaskDto** | [MoveTaskDto](MoveTaskDto.md) |             |                           |

### Return type

[**TasksControllerCreate201Response**](TasksControllerCreate201Response.md)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`

### HTTP response details

| Status code | Description | Response headers |
| ----------- | ----------- | ---------------- |
| **200**     |             | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## tasksControllerUpdate

> TasksControllerCreate201Response tasksControllerUpdate(id, updateTaskDto)

Update a task

### Example

```ts
import { Configuration, TasksApi } from 'todo-sdk';
import type { TasksControllerUpdateRequest } from 'todo-sdk';

async function example() {
  console.log('🚀 Testing  SDK...');
  const config = new Configuration({
    // Configure HTTP bearer authorization: bearer
    accessToken: 'YOUR BEARER TOKEN',
  });
  const api = new TasksApi(config);

  const body = {
    // string
    id: id_example,
    // UpdateTaskDto
    updateTaskDto: { title: 'Updated title' },
  } satisfies TasksControllerUpdateRequest;

  try {
    const data = await api.tasksControllerUpdate(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name              | Type                              | Description | Notes                     |
| ----------------- | --------------------------------- | ----------- | ------------------------- |
| **id**            | `string`                          |             | [Defaults to `undefined`] |
| **updateTaskDto** | [UpdateTaskDto](UpdateTaskDto.md) |             |                           |

### Return type

[**TasksControllerCreate201Response**](TasksControllerCreate201Response.md)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`

### HTTP response details

| Status code | Description | Response headers |
| ----------- | ----------- | ---------------- |
| **200**     |             | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## tasksControllerUpdateOrder

> TasksControllerCreate201Response tasksControllerUpdateOrder(id, updateTaskOrderDto)

Update task order within its list

### Example

```ts
import { Configuration, TasksApi } from 'todo-sdk';
import type { TasksControllerUpdateOrderRequest } from 'todo-sdk';

async function example() {
  console.log('🚀 Testing  SDK...');
  const config = new Configuration({
    // Configure HTTP bearer authorization: bearer
    accessToken: 'YOUR BEARER TOKEN',
  });
  const api = new TasksApi(config);

  const body = {
    // string
    id: id_example,
    // UpdateTaskOrderDto
    updateTaskOrderDto: { order: 2 },
  } satisfies TasksControllerUpdateOrderRequest;

  try {
    const data = await api.tasksControllerUpdateOrder(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name                   | Type                                        | Description | Notes                     |
| ---------------------- | ------------------------------------------- | ----------- | ------------------------- |
| **id**                 | `string`                                    |             | [Defaults to `undefined`] |
| **updateTaskOrderDto** | [UpdateTaskOrderDto](UpdateTaskOrderDto.md) |             |                           |

### Return type

[**TasksControllerCreate201Response**](TasksControllerCreate201Response.md)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`

### HTTP response details

| Status code | Description | Response headers |
| ----------- | ----------- | ---------------- |
| **200**     |             | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
