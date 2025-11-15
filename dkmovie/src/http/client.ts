export interface PaginationDataProps<T = any> {
  items: T;
  count: number;
}

/**
 * A type-safe HTTP client wrapper around the native fetch API.
 * It handles JSON request/response logic and basic error handling.
 */
export class HttpClient {
  private readonly baseUrl = "/api";

  /**
   * The core request method. All public methods (get, post, etc.) use this.
   * @param endpoint - The API endpoint (e.g., "/users").
   * @param options - The native RequestInit options.
   * @returns A promise that resolves to the JSON response data.
   */
  private async request<T>(endpoint: string, options: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, options);

    // Handle non-OK responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({})); // Try to get error details
      const error = new Error(
        `HTTP error! Status: ${response.status} ${response.statusText}`,
      );

      // Attach status and error data to the error object for better debugging
      (error as any).status = response.status;
      (error as any).data = errorData;

      console.error("HTTP Request Failed:", error);
      throw error;
    }

    // Handle 204 No Content (e.g., successful DELETE)
    if (response.status === 204) {
      return null as T;
    }

    // Parse the JSON response
    return response.json() as Promise<T>;
  }

  /**
   * Performs a GET request.
   * @param endpoint - The API endpoint.
   * @param options - Optional RequestInit settings.
   * @returns A promise that resolves to the response data.
   */
  public get<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  /**
   * Performs a POST request.
   * @param endpoint - The API endpoint.
   * @param body - The data to send in the request body (will be stringified).
   * @param options - Optional RequestInit settings.
   * @returns A promise that resolves to the response data.
   */
  public post<T>(
    endpoint: string,
    body: unknown,
    options: RequestInit = {},
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  /**
   * Performs a PUT request.
   * @param endpoint - The API endpoint.
   * @param body - The data to send in the request body (will be stringified).
   * @param options - Optional RequestInit settings.
   * @returns A promise that resolves to the response data.
   */
  public put<T>(
    endpoint: string,
    body: unknown,
    options: RequestInit = {},
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: JSON.stringify(body),
    });
  }

  /**
   * Performs a PATCH request.
   * @param endpoint - The API endpoint.
   * @param body - The data to send in the request body (will be stringified).
   * @param options - Optional RequestInit settings.
   * @returns A promise that resolves to the response data.
   */
  public patch<T>(
    endpoint: string,
    body: unknown,
    options: RequestInit = {},
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(body),
    });
  }

  /**
   * Performs a DELETE request.
   * @param endpoint - The API endpoint.
   * @param options - Optional RequestInit settings.
   * @returns A promise that resolves (often to null or a confirmation message).
   */
  public delete<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }
}

export const httpClient = new HttpClient();
