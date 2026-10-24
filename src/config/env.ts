export const env = {
  apiBaseUrl:
    (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_BASE_URL) ||
    "/api",
  useMock:
    (typeof process !== "undefined" &&
      process.env?.NEXT_PUBLIC_USE_MOCK === "true"),
};
