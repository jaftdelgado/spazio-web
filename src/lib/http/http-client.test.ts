import { authStorage } from "@lib/auth/auth-storage";

import { httpClient } from "./http-client";
import { HttpError } from "./http-errors";

describe("httpClient", () => {
  it("sends JSON requests with auth headers", async () => {
    authStorage.setAccessToken("token-123");
    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );

    const result = await httpClient.post<{ ok: boolean }>("/api/test", {
      hello: "world",
    });

    expect(result).toEqual({ ok: true });
    expect(fetchSpy).toHaveBeenCalledWith(
      "http://localhost:8080/api/test",
      expect.objectContaining({
        method: "POST",
        credentials: "include",
        headers: expect.objectContaining({
          Authorization: "Bearer token-123",
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({ hello: "world" }),
      }),
    );
  });

  it("does not force a content type for form data", async () => {
    const formData = new FormData();
    formData.append("file", new File(["hello"], "hello.txt"));

    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );

    await httpClient.post("/api/upload", formData);

    expect(fetchSpy).toHaveBeenCalledWith(
      "http://localhost:8080/api/upload",
      expect.objectContaining({
        headers: {},
        body: formData,
      }),
    );
  });

  it("returns plain text responses when the server does not send JSON", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response("accepted", {
        status: 202,
        headers: { "content-type": "text/plain" },
      }),
    );

    await expect(httpClient.get<string>("/api/text")).resolves.toBe("accepted");
  });

  it("throws HttpError with parsed response data on failure", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "content-type": "application/json" },
      }),
    );

    await expect(httpClient.get("/api/protected")).rejects.toEqual(
      expect.objectContaining({
        status: 401,
        body: { error: "Unauthorized" },
      }),
    );
  });
});
