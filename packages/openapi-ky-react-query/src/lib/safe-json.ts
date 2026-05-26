export async function safeJson<T>(
  promise: PromiseLike<{ text(): Promise<string>; json(): Promise<T> }>,
): Promise<T> {
  const response = await promise;
  const text = await response.text();
  if (text === "") {
    return undefined as T;
  }
  return JSON.parse(text) as T;
}
