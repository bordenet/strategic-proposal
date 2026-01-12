import { isLocalhost, initMockMode, isMockEnabled, getMockResponse } from "../js/ai-mock.js";

describe("AI Mock Module", () => {
  test("should export isLocalhost function", () => {
    expect(typeof isLocalhost).toBe('function');
  });

  test("should export initMockMode function", () => {
    expect(typeof initMockMode).toBe('function');
  });

  test("should export isMockEnabled function", () => {
    expect(typeof isMockEnabled).toBe('function');
  });

  test("should export getMockResponse function", () => {
    expect(typeof getMockResponse).toBe('function');
  });

  test("getMockResponse should return Phase 1 response", () => {
    const project = { dealershipName: "Test Motors" };
    const response = getMockResponse(1, project);

    expect(response).toContain("Phase 1");
    expect(response).toContain("Test Motors");
  });

  test("getMockResponse should return Phase 2 response", () => {
    const project = { dealershipName: "ABC Dealership" };
    const response = getMockResponse(2, project);

    expect(response).toContain("Phase 2");
    expect(response).toContain("ABC Dealership");
  });

  test("getMockResponse should return Phase 3 response", () => {
    const project = { dealershipName: "XYZ Auto" };
    const response = getMockResponse(3, project);

    expect(response).toContain("Strategic Proposal");
    expect(response).toContain("XYZ Auto");
  });

  test("getMockResponse should handle missing dealership name", () => {
    const project = {};
    const response = getMockResponse(1, project);

    expect(response).toContain("Test Dealership");
  });

  test("getMockResponse should handle invalid phase", () => {
    const project = { dealershipName: "Test" };
    const response = getMockResponse(99, project);

    expect(response).toContain("not available");
  });
});
