import { HttpError } from "./http-errors";

describe("HttpError", () => {
  it("stores status and body with a default message", () => {
    const error = new HttpError(404, { error: "Not found" });

    expect(error.name).toBe("HttpError");
    expect(error.message).toBe("HTTP request failed with status 404");
    expect(error.status).toBe(404);
    expect(error.body).toEqual({ error: "Not found" });
  });

  it("uses a custom message when provided", () => {
    const error = new HttpError(500, null, "Boom");

    expect(error.message).toBe("Boom");
  });
});
