# UpdateTaskOrderDto

## Properties

| Name    | Type   |
| ------- | ------ |
| `order` | number |

## Example

```typescript
import type { UpdateTaskOrderDto } from 'todo-sdk';

// TODO: Update the object below with actual values
const example = {
  order: 2,
} satisfies UpdateTaskOrderDto;

console.log(example);

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example);
console.log(exampleJSON);

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as UpdateTaskOrderDto;
console.log(exampleParsed);
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
