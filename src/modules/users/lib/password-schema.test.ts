import { createStrongPasswordSchema } from "./password-schema";

const t = (key: string) => key;

describe("createStrongPasswordSchema", () => {
  it("accepts a strong password", () => {
    const schema = createStrongPasswordSchema(t);

    expect(schema.parse("Password1!")).toBe("Password1!");
  });

  it("rejects a weak password", () => {
    const schema = createStrongPasswordSchema(t);

    expect(() => schema.parse("password")).toThrow(
      "auth.signUp.password.validation.uppercase",
    );
  });
});
