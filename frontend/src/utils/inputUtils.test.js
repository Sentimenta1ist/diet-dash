import { validateDigitsInput } from "./inputUtils";

describe("validateDigitsInput", () => {
  it("returns the numeric value for a digits-only string", () => {
    expect(validateDigitsInput("123")).toBe(123);
  });

  it("returns 0 for an empty string", () => {
    expect(validateDigitsInput("")).toBe(0);
  });

  it("returns 0 for a string with only non-digit characters", () => {
    expect(validateDigitsInput("abc")).toBe(0);
  });

  it("strips non-digit characters and returns the remaining number", () => {
    expect(validateDigitsInput("12abc34")).toBe(1234);
  });

  it("strips leading non-digits", () => {
    expect(validateDigitsInput("abc99")).toBe(99);
  });

  it("truncates to 5 digits maximum", () => {
    expect(validateDigitsInput("123456789")).toBe(12345);
  });

  it("handles exactly 5 digits without truncation", () => {
    expect(validateDigitsInput("99999")).toBe(99999);
  });

  it("returns 0 for the string '0'", () => {
    expect(validateDigitsInput("0")).toBe(0);
  });

  it("handles strings with spaces", () => {
    expect(validateDigitsInput("1 2 3")).toBe(123);
  });

  it("handles decimal points (strips them)", () => {
    expect(validateDigitsInput("1.5")).toBe(15);
  });
});
