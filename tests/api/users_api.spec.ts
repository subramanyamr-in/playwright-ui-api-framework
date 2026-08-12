import { test, expect } from '@fixtures/UiFixture.js';

test.describe('JSONPlaceholder Users API Test Suite', () => {
  test('[API-006] GET /users - Should retrieve user list and validate user schema', async ({
    apiActions,
  }) => {
    const response = await apiActions.get('/users');
    await apiActions.validateStatusCode(response, 200);

    const users =
      await apiActions.getResponseJson<
        Array<{ id: number; name: string; email: string; address: { city: string } }>
      >(response);

    expect(users.length).toBeGreaterThan(0);
    const firstUser = users[0]!;
    expect(firstUser).toHaveProperty('id');
    expect(firstUser).toHaveProperty('name');
    expect(firstUser).toHaveProperty('email');
    expect(firstUser.address).toHaveProperty('city');
  });

  test('[API-007] GET /users/1 - Should return 200 and correct user headers', async ({
    apiActions,
  }) => {
    const response = await apiActions.get('/users/1');
    await apiActions.validateStatusCode(response, 200);

    const headers = response.headers();
    expect(headers['content-type']).toContain('application/json');
  });
});
