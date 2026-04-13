# AuthApi

All URIs are relative to _http://localhost_

| Method                                                          | HTTP request            | Description                   |
| --------------------------------------------------------------- | ----------------------- | ----------------------------- |
| [**authControllerLogin**](AuthApi.md#authcontrollerlogin)       | **POST** /auth/login    | Login with email and password |
| [**authControllerRegister**](AuthApi.md#authcontrollerregister) | **POST** /auth/register | Register a new user           |

## authControllerLogin

> AuthControllerRegister201Response authControllerLogin(loginDto)

Login with email and password

### Example

```ts
import { Configuration, AuthApi } from 'todo-sdk';
import type { AuthControllerLoginRequest } from 'todo-sdk';

async function example() {
  console.log('🚀 Testing  SDK...');
  const api = new AuthApi();

  const body = {
    loginDto: { email: 'user@example.com', password: 'password123' },
  } satisfies AuthControllerLoginRequest;

  try {
    const data = await api.authControllerLogin(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name         | Type                    | Description | Notes |
| ------------ | ----------------------- | ----------- | ----- |
| **loginDto** | [LoginDto](LoginDto.md) |             |       |

### Return type

[**AuthControllerRegister201Response**](AuthControllerRegister201Response.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`

### HTTP response details

| Status code | Description | Response headers |
| ----------- | ----------- | ---------------- |
| **200**     |             | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## authControllerRegister

> AuthControllerRegister201Response authControllerRegister(registerDto)

Register a new user

### Example

```ts
import { Configuration, AuthApi } from 'todo-sdk';
import type { AuthControllerRegisterRequest } from 'todo-sdk';

async function example() {
  console.log('🚀 Testing  SDK...');
  const api = new AuthApi();

  const body = {
    registerDto: { email: 'user@example.com', password: 'password123' },
  } satisfies AuthControllerRegisterRequest;

  try {
    const data = await api.authControllerRegister(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name            | Type                          | Description | Notes |
| --------------- | ----------------------------- | ----------- | ----- |
| **registerDto** | [RegisterDto](RegisterDto.md) |             |       |

### Return type

[**AuthControllerRegister201Response**](AuthControllerRegister201Response.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`

### HTTP response details

| Status code | Description | Response headers |
| ----------- | ----------- | ---------------- |
| **201**     |             | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
