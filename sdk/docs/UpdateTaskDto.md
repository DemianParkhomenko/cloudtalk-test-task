# UpdateTaskDto

## Properties

| Name        | Type    |
| ----------- | ------- |
| `title`     | string  |
| `notes`     | string  |
| `completed` | boolean |

## Example

```typescript
import type { UpdateTaskDto } from 'todo-sdk';

// TODO: Update the object below with actual values
const example = {
  title: null,
  notes: null,
  completed: null,
} satisfies UpdateTaskDto;

console.log(example);

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example);
console.log(exampleJSON);

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as UpdateTaskDto;
console.log(exampleParsed);
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
