import type { APIRequestContext, APIResponse } from '@playwright/test';
import { expect } from '@playwright/test';
import { Logger } from '@logger/Logger.js';
import { StepRunner } from '@reporting/StepRunner.js';

export interface ApiRequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
  data?: unknown;
  timeout?: number;
  failOnStatusCode?: boolean;
}

/**
 * Enterprise API action wrapper encapsulating Playwright `APIRequestContext`.
 * Provides structured request execution, automatic URL resolution, status code verification,
 * Winston logging, and step tracking.
 */
export class ApiActions {
  private readonly requestContext: APIRequestContext;
  private readonly baseUrl: string;

  /**
   * Constructs an instance of `ApiActions`.
   *
   * @param requestContext - Playwright `APIRequestContext` instance.
   * @param baseUrl - Optional base URL override. Defaults to process.env.API_BASE_URL.
   */
  constructor(requestContext: APIRequestContext, baseUrl?: string) {
    this.requestContext = requestContext;
    this.baseUrl = (baseUrl || process.env['API_BASE_URL'] || '').replace(/\/+$/, '');
  }

  /**
   * Resolves endpoint against base URL if relative path is provided.
   */
  private resolveUrl(endpoint: string): string {
    if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
      return endpoint;
    }
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${this.baseUrl}${cleanEndpoint}`;
  }

  /**
   * Executes an HTTP request with logging and step instrumentation.
   *
   * @param method - HTTP Method (GET, POST, PUT, PATCH, DELETE).
   * @param endpoint - Request endpoint or full URL.
   * @param options - Request headers, params, body, and configuration options.
   * @returns Playwright `APIResponse` object.
   */
  async sendRequest(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<APIResponse> {
    const url = this.resolveUrl(endpoint);

    return StepRunner.run(`API ${method} -> ${endpoint}`, async () => {
      Logger.info(`[API Request] ${method} ${url}`, {
        params: options.params,
        headers: options.headers,
        hasData: !!options.data,
      });

      const startTime = Date.now();
      let response: APIResponse;

      const requestPayload = {
        headers: options.headers,
        params: options.params,
        data: options.data,
        timeout: options.timeout,
        failOnStatusCode: options.failOnStatusCode ?? false,
      };

      switch (method) {
        case 'GET':
          response = await this.requestContext.get(url, requestPayload);
          break;
        case 'POST':
          response = await this.requestContext.post(url, requestPayload);
          break;
        case 'PUT':
          response = await this.requestContext.put(url, requestPayload);
          break;
        case 'PATCH':
          response = await this.requestContext.patch(url, requestPayload);
          break;
        case 'DELETE':
          response = await this.requestContext.delete(url, requestPayload);
          break;
        default:
          throw new Error(`Unsupported HTTP method: ${method}`);
      }

      const durationMs = Date.now() - startTime;
      Logger.info(
        `[API Response] ${method} ${url} | Status: ${response.status()} (${durationMs}ms)`
      );

      return response;
    });
  }

  /**
   * Executes an HTTP GET request.
   */
  async get(endpoint: string, options?: ApiRequestOptions): Promise<APIResponse> {
    return this.sendRequest('GET', endpoint, options);
  }

  /**
   * Executes an HTTP POST request.
   */
  async post(
    endpoint: string,
    data?: unknown,
    options: ApiRequestOptions = {}
  ): Promise<APIResponse> {
    return this.sendRequest('POST', endpoint, { ...options, data });
  }

  /**
   * Executes an HTTP PUT request.
   */
  async put(
    endpoint: string,
    data?: unknown,
    options: ApiRequestOptions = {}
  ): Promise<APIResponse> {
    return this.sendRequest('PUT', endpoint, { ...options, data });
  }

  /**
   * Executes an HTTP PATCH request.
   */
  async patch(
    endpoint: string,
    data?: unknown,
    options: ApiRequestOptions = {}
  ): Promise<APIResponse> {
    return this.sendRequest('PATCH', endpoint, { ...options, data });
  }

  /**
   * Executes an HTTP DELETE request.
   */
  async delete(endpoint: string, options?: ApiRequestOptions): Promise<APIResponse> {
    return this.sendRequest('DELETE', endpoint, options);
  }

  /**
   * Asserts that an API response matches expected HTTP status code.
   *
   * @param response - Playwright `APIResponse`.
   * @param expectedStatus - Expected numeric HTTP status code (e.g. 200, 201, 204).
   */
  async validateStatusCode(response: APIResponse, expectedStatus: number): Promise<void> {
    const actualStatus = response.status();
    Logger.debug(`Validating status code: expected=${expectedStatus}, actual=${actualStatus}`);
    expect(
      actualStatus,
      `API response status code should be ${expectedStatus} but got ${actualStatus}`
    ).toBe(expectedStatus);
  }

  /**
   * Parses and returns JSON payload from an API response.
   *
   * @template T - Expected return type.
   * @param response - Playwright `APIResponse`.
   * @returns Parsed JSON body object.
   */
  async getResponseJson<T = unknown>(response: APIResponse): Promise<T> {
    try {
      return (await response.json()) as T;
    } catch (error) {
      Logger.error(`Failed to parse API response as JSON: ${(error as Error).message}`);
      throw error;
    }
  }
}
