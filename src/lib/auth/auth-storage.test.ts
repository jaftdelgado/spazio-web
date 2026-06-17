import { authStorage } from "./auth-storage";

describe("authStorage", () => {
  it("stores and reads both tokens", () => {
    authStorage.setAccessToken("access-token");
    authStorage.setRefreshToken("refresh-token");

    expect(authStorage.getAccessToken()).toBe("access-token");
    expect(authStorage.getRefreshToken()).toBe("refresh-token");
  });

  it("clears stored tokens", () => {
    authStorage.setAccessToken("access-token");
    authStorage.setRefreshToken("refresh-token");

    authStorage.clearTokens();

    expect(authStorage.getAccessToken()).toBeNull();
    expect(authStorage.getRefreshToken()).toBeNull();
  });
});
