import { test, expect } from '@fixtures/UiFixture.js';

test.describe('JSONPlaceholder Posts API Test Suite', () => {
  test('[API-001] GET /posts - Should retrieve all posts with status 200', async ({
    apiActions,
  }) => {
    const response = await apiActions.get('/posts');
    await apiActions.validateStatusCode(response, 200);

    const posts = await apiActions.getResponseJson<Array<{ id: number; title: string }>>(response);
    expect(Array.isArray(posts)).toBe(true);
    expect(posts.length).toBeGreaterThan(0);
    expect(posts[0]).toHaveProperty('id');
    expect(posts[0]).toHaveProperty('title');
  });

  test('[API-002] GET /posts/1 - Should retrieve single post by ID', async ({ apiActions }) => {
    const response = await apiActions.get('/posts/1');
    await apiActions.validateStatusCode(response, 200);

    const post = await apiActions.getResponseJson<{ id: number; userId: number; title: string }>(
      response
    );
    expect(post.id).toBe(1);
    expect(post).toHaveProperty('title');
    expect(post).toHaveProperty('userId');
  });

  test('[API-003] POST /posts - Should create new post with status 201', async ({ apiActions }) => {
    const newPostData = {
      title: 'FrameWright API Test Post',
      body: 'Automated API testing integration using Playwright and TypeScript.',
      userId: 1,
    };

    const response = await apiActions.post('/posts', newPostData);
    await apiActions.validateStatusCode(response, 201);

    const createdPost = await apiActions.getResponseJson<{ id: number; title: string }>(response);
    expect(createdPost.title).toBe(newPostData.title);
    expect(createdPost).toHaveProperty('id');
  });

  test('[API-004] PUT /posts/1 - Should update existing post with status 200', async ({
    apiActions,
  }) => {
    const updatedPostData = {
      id: 1,
      title: 'Updated Post Title by FrameWright',
      body: 'Updated post body content.',
      userId: 1,
    };

    const response = await apiActions.put('/posts/1', updatedPostData);
    await apiActions.validateStatusCode(response, 200);

    const updatedPost = await apiActions.getResponseJson<{ title: string }>(response);
    expect(updatedPost.title).toBe(updatedPostData.title);
  });

  test('[API-005] DELETE /posts/1 - Should delete post resource with status 200', async ({
    apiActions,
  }) => {
    const response = await apiActions.delete('/posts/1');
    await apiActions.validateStatusCode(response, 200);
  });
});
