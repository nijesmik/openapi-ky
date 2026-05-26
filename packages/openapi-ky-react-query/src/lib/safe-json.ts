export async function safeJson<T>(
  promise: PromiseLike<{ status: number; json(): Promise<T> }>,
): Promise<T> {
  const response = await promise;
  if (response.status === 204) {
    return undefined as T;
  }
  return response.json();
}
