import { AUTH_SESSION_CHANGED_EVENT, auth } from "./auth";

describe("auth", () => {
  it("dispatches the auth session changed event", () => {
    const listener = vi.fn();
    window.addEventListener(AUTH_SESSION_CHANGED_EVENT, listener);

    auth.notifySessionChanged();

    expect(listener).toHaveBeenCalledTimes(1);

    window.removeEventListener(AUTH_SESSION_CHANGED_EVENT, listener);
  });
});
