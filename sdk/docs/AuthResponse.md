# AuthResponse

## Properties

| Name          | Type            |
| ------------- | --------------- |
| `accessToken` | string          |
| `user`        | [User](User.md) |

## Example

```typescript
import type { AuthResponse } from 'todo-sdk';

// TODO: Update the object below with actual values
const example = {
  accessToken: null,
  user: null,
} satisfies AuthResponse;

console.log(example);

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example);
console.log(exampleJSON);

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as AuthResponse;
console.log(exampleParsed);
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
