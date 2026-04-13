# AuthControllerRegister201Response

## Properties

| Name        | Type                            |
| ----------- | ------------------------------- |
| `data`      | [AuthResponse](AuthResponse.md) |
| `timestamp` | string                          |

## Example

```typescript
import type { AuthControllerRegister201Response } from 'todo-sdk';

// TODO: Update the object below with actual values
const example = {
  data: null,
  timestamp: null,
} satisfies AuthControllerRegister201Response;

console.log(example);

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example);
console.log(exampleJSON);

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as AuthControllerRegister201Response;
console.log(exampleParsed);
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
