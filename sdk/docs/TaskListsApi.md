# TaskListsApi

All URIs are relative to _http://localhost_

| Method                                                                               | HTTP request                     | Description                                   |
| ------------------------------------------------------------------------------------ | -------------------------------- | --------------------------------------------- |
| [**taskListsControllerCreate**](TaskListsApi.md#tasklistscontrollercreate)           | **POST** /task-lists             | Create a new task list                        |
| [**taskListsControllerDelete**](TaskListsApi.md#tasklistscontrollerdelete)           | **DELETE** /task-lists/{id}      | Delete a task list                            |
| [**taskListsControllerFindAll**](TaskListsApi.md#tasklistscontrollerfindall)         | **GET** /task-lists              | Get all task lists for the authenticated user |
| [**taskListsControllerUpdate**](TaskListsApi.md#tasklistscontrollerupdate)           | **PATCH** /task-lists/{id}       | Update task list name                         |
| [**taskListsControllerUpdateOrder**](TaskListsApi.md#tasklistscontrollerupdateorder) | **PATCH** /task-lists/{id}/order | Update task list order                        |

## taskListsControllerCreate

> TaskListsControllerCreate201Response taskListsControllerCreate(createTaskListDto)

Create a new task list

### Example

```ts
import { Configuration, TaskListsApi } from 'todo-sdk';
import type { TaskListsControllerCreateRequest } from 'todo-sdk';

async function example() {
  console.log('🚀 Testing  SDK...');
  const config = new Configuration({
    // Configure HTTP bearer authorization: bearer
    accessToken: 'YOUR BEARER TOKEN',
  });
  const api = new TaskListsApi(config);

  const body = {
    // CreateTaskListDto
    createTaskListDto: { name: 'My Tasks' },
  } satisfies TaskListsControllerCreateRequest;

  try {
    const data = await api.taskListsControllerCreate(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name                  | Type                                      | Description | Notes |
| --------------------- | ----------------------------------------- | ----------- | ----- |
| **createTaskListDto** | [CreateTaskListDto](CreateTaskListDto.md) |             |       |

### Return type

[**TaskListsControllerCreate201Response**](TaskListsControllerCreate201Response.md)

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

## taskListsControllerDelete

> taskListsControllerDelete(id)

Delete a task list

### Example

```ts
import { Configuration, TaskListsApi } from 'todo-sdk';
import type { TaskListsControllerDeleteRequest } from 'todo-sdk';

async function example() {
  console.log('🚀 Testing  SDK...');
  const config = new Configuration({
    // Configure HTTP bearer authorization: bearer
    accessToken: 'YOUR BEARER TOKEN',
  });
  const api = new TaskListsApi(config);

  const body = {
    // string
    id: id_example,
  } satisfies TaskListsControllerDeleteRequest;

  try {
    const data = await api.taskListsControllerDelete(body);
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

## taskListsControllerFindAll

> TaskListsControllerFindAll200Response taskListsControllerFindAll()

Get all task lists for the authenticated user

### Example

```ts
import { Configuration, TaskListsApi } from 'todo-sdk';
import type { TaskListsControllerFindAllRequest } from 'todo-sdk';

async function example() {
  console.log('🚀 Testing  SDK...');
  const config = new Configuration({
    // Configure HTTP bearer authorization: bearer
    accessToken: 'YOUR BEARER TOKEN',
  });
  const api = new TaskListsApi(config);

  try {
    const data = await api.taskListsControllerFindAll();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**TaskListsControllerFindAll200Response**](TaskListsControllerFindAll200Response.md)

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

## taskListsControllerUpdate

> TaskListsControllerCreate201Response taskListsControllerUpdate(id, updateTaskListDto)

Update task list name

### Example

```ts
import { Configuration, TaskListsApi } from 'todo-sdk';
import type { TaskListsControllerUpdateRequest } from 'todo-sdk';

async function example() {
  console.log('🚀 Testing  SDK...');
  const config = new Configuration({
    // Configure HTTP bearer authorization: bearer
    accessToken: 'YOUR BEARER TOKEN',
  });
  const api = new TaskListsApi(config);

  const body = {
    // string
    id: id_example,
    // UpdateTaskListDto
    updateTaskListDto: { name: 'Updated Name' },
  } satisfies TaskListsControllerUpdateRequest;

  try {
    const data = await api.taskListsControllerUpdate(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name                  | Type                                      | Description | Notes                     |
| --------------------- | ----------------------------------------- | ----------- | ------------------------- |
| **id**                | `string`                                  |             | [Defaults to `undefined`] |
| **updateTaskListDto** | [UpdateTaskListDto](UpdateTaskListDto.md) |             |                           |

### Return type

[**TaskListsControllerCreate201Response**](TaskListsControllerCreate201Response.md)

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

## taskListsControllerUpdateOrder

> TaskListsControllerCreate201Response taskListsControllerUpdateOrder(id, updateTaskListOrderDto)

Update task list order

### Example

```ts
import { Configuration, TaskListsApi } from 'todo-sdk';
import type { TaskListsControllerUpdateOrderRequest } from 'todo-sdk';

async function example() {
  console.log('🚀 Testing  SDK...');
  const config = new Configuration({
    // Configure HTTP bearer authorization: bearer
    accessToken: 'YOUR BEARER TOKEN',
  });
  const api = new TaskListsApi(config);

  const body = {
    // string
    id: id_example,
    // UpdateTaskListOrderDto
    updateTaskListOrderDto: { order: 0 },
  } satisfies TaskListsControllerUpdateOrderRequest;

  try {
    const data = await api.taskListsControllerUpdateOrder(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name                       | Type                                                | Description | Notes                     |
| -------------------------- | --------------------------------------------------- | ----------- | ------------------------- |
| **id**                     | `string`                                            |             | [Defaults to `undefined`] |
| **updateTaskListOrderDto** | [UpdateTaskListOrderDto](UpdateTaskListOrderDto.md) |             |                           |

### Return type

[**TaskListsControllerCreate201Response**](TaskListsControllerCreate201Response.md)

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
