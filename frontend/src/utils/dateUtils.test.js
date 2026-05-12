import { formatDate, getNextDay } from "./dateUtils";

describe("formatDate", () => {
  it("returns null for null input", () => {
    expect(formatDate(null)).toBeNull();
  });

  it("returns null for undefined input", () => {
    expect(formatDate(undefined)).toBeNull();
  });

  it("passes through a valid YYYY-MM-DD string unchanged", () => {
    expect(formatDate("2026-02-26")).toBe("2026-02-26");
  });

  it("formats a local Date object correctly", () => {
    const date = new Date(2026, 1, 26); // Feb 26 2026, local time
    expect(formatDate(date)).toBe("2026-02-26");
  });

  it("pads single-digit month and day", () => {
    const date = new Date(2026, 0, 5); // Jan 5 2026
    expect(formatDate(date)).toBe("2026-01-05");
  });

  it("throws for an invalid string", () => {
    expect(() => formatDate("not-a-date")).toThrow();
  });

  it("throws for a non-ISO string that parses as NaN", () => {
    expect(() => formatDate("hello world")).toThrow();
  });
});

describe("getNextDay", () => {
  it("returns the next calendar day", () => {
    const date = new Date(2026, 1, 26); // Feb 26 2026
    const next = getNextDay(date);
    expect(next.getFullYear()).toBe(2026);
    expect(next.getMonth()).toBe(1);
    expect(next.getDate()).toBe(27);
  });

  it("rolls over month boundary correctly", () => {
    const date = new Date(2026, 1, 28); // Feb 28 2026
    const next = getNextDay(date);
    expect(next.getMonth()).toBe(2); // March
    expect(next.getDate()).toBe(1);
  });

  it("rolls over year boundary correctly", () => {
    const date = new Date(2025, 11, 31); // Dec 31 2025
    const next = getNextDay(date);
    expect(next.getFullYear()).toBe(2026);
    expect(next.getMonth()).toBe(0);
    expect(next.getDate()).toBe(1);
  });

  it("does not mutate the original date", () => {
    const date = new Date(2026, 1, 26);
    getNextDay(date);
    expect(date.getDate()).toBe(26);
  });
});
