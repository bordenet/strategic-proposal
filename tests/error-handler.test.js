import { handleError, withErrorHandling } from "../js/error-handler.js";

describe("Error Handler Module", () => {
  test("should export handleError function", () => {
    expect(typeof handleError).toBe('function');
  });

  test("should export withErrorHandling function", () => {
    expect(typeof withErrorHandling).toBe('function');
  });

  test("should handle error with context", () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const error = new Error("Test error");

    handleError(error, "TestContext");

    expect(consoleSpy).toHaveBeenCalledWith("[TestContext]", error);
    consoleSpy.mockRestore();
  });

  test("should handle error with default context", () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const error = new Error("Test error");

    handleError(error);

    expect(consoleSpy).toHaveBeenCalledWith("[Operation]", error);
    consoleSpy.mockRestore();
  });

  test("withErrorHandling should wrap async function", async () => {
    const mockFn = jest.fn().mockResolvedValue("success");
    const wrapped = withErrorHandling(mockFn, "Test");

    const result = await wrapped("arg1", "arg2");

    expect(result).toBe("success");
    expect(mockFn).toHaveBeenCalledWith("arg1", "arg2");
  });

  test("withErrorHandling should catch and rethrow errors", async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const error = new Error("Async error");
    const mockFn = jest.fn().mockRejectedValue(error);
    const wrapped = withErrorHandling(mockFn, "AsyncTest");

    await expect(wrapped()).rejects.toThrow("Async error");
    expect(consoleSpy).toHaveBeenCalledWith("[AsyncTest]", error);
    consoleSpy.mockRestore();
  });
});
