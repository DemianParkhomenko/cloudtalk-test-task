import { Configuration, AuthApi, TaskListsApi, TasksApi, ResponseError } from 'todo-sdk';

export { ResponseError };

const API_URL = process.env['API_URL'] ?? 'http://localhost:3000';

export interface AuthTokens {
  accessToken: string;
  userId: string;
  email: string;
}

function makeConfig(accessToken?: string): Configuration {
  return new Configuration({ basePath: API_URL, accessToken });
}

export function getAuthApi(): AuthApi {
  return new AuthApi(makeConfig());
}

export function getTaskListsApi(accessToken: string): TaskListsApi {
  return new TaskListsApi(makeConfig(accessToken));
}

export function getTasksApi(accessToken: string): TasksApi {
  return new TasksApi(makeConfig(accessToken));
}

export async function registerUser(email: string, password: string): Promise<AuthTokens> {
  const result = await getAuthApi().authControllerRegister({ registerDto: { email, password } });
  const { accessToken, user } = result.data!;
  return { accessToken: accessToken!, userId: user!.id!, email: user!.email! };
}

export async function loginUser(email: string, password: string): Promise<AuthTokens> {
  const result = await getAuthApi().authControllerLogin({ loginDto: { email, password } });
  const { accessToken, user } = result.data!;
  return { accessToken: accessToken!, userId: user!.id!, email: user!.email! };
}

export function randomEmail(): string {
  return `test-${Date.now()}-${Math.random().toString(36).slice(2)}@test.com`;
}
