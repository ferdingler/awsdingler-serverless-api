const helloService = require("../helloService.js");

describe("HelloService", function () {
  it("sayHello returns a message and a location", async () => {
    const response = await helloService.sayHello("Fernando");
    expect(response.message).toEqual("Hello Fernando");
  });
});
