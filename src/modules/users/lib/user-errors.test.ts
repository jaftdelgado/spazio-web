import { HttpError } from "@lib/http/http-errors";

import { getUserErrorMessage } from "./user-errors";

describe("getUserErrorMessage", () => {
  it("returns backend error messages from HttpError", () => {
    expect(
      getUserErrorMessage(
        new HttpError(400, { error: "Friendly error" }),
        "Fallback",
      ),
    ).toBe("Friendly error");
  });

  it("returns Error messages and falls back otherwise", () => {
    expect(getUserErrorMessage(new Error("Boom"), "Fallback")).toBe("Boom");
    expect(getUserErrorMessage("unknown", "Fallback")).toBe("Fallback");
  });
});
