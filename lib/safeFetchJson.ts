// lib/safeFetchJson.ts
export async function safeFetchJson<T = any>(
  url: string,
  options?: RequestInit
): Promise<T | null> {
  const res = await fetch(url, options);

  const contentType = res.headers.get("content-type") || "";
  const text = await res.text();

  // If the server returned HTML instead of JSON, STOP SAFELY
  if (!contentType.includes("application/json")) {
    console.error("❌ Non-JSON response");
    console.error("Status:", res.status);
    console.error("Content-Type:", contentType);
    console.error("Body preview:", text.slice(0, 500));

    alert(
      "Something went wrong, but the app did NOT crash.\n\n" +
      "This usually means a page (HTML) was returned instead of JSON.\n\n" +
      "Check the console for details."
    );

    return null;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    console.error("❌ Failed to parse JSON");
    console.error("Body preview:", text.slice(0, 500));

    alert("Server returned invalid JSON. Check console.");
    return null;
  }
}
