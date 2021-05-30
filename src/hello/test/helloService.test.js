const helloService = require("../helloService.js");

jest.mock("aws-embedded-metrics", () => ({
  Unit: {},
  createMetricsLogger: () => ({
    putMetric: jest.fn(),
    flush: jest.fn(),
  }),
}));

describe("HelloService", function () {
  it("sayHello returns a message and a location", async () => {
    const response = await helloService.sayHello("Fernando");
    expect(response.message).toEqual("Hello Fernando");
  });
});
