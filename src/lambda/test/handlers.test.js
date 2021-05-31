const handlers = require("../handlers");
const hello = require("../../hello");

test("sayHello handler", async () => {
  const event = {};
  jest.spyOn(hello, "queueHello").mockReturnValue(null);
  const response = await handlers.helloWorld(event);
  expect(response.statusCode).toEqual(200);
  const body = JSON.parse(response.body);
  expect(body.message).toEqual("Hello World");
});
