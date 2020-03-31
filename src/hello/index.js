const helloService = require('./helloService');
const queue = require('./queue');

exports.sayHello = helloService.sayHello;
exports.queueHello = queue.queueHelloMessage;