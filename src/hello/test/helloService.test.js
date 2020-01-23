'use strict';

const helloService = require('../helloService.js');
const chai = require('chai');
const expect = chai.expect;

describe('HelloService', function () {
    context('sayHello', () => {
        it('returns a message and a location', async () => {
            const response = await helloService.sayHello();
            expect(response).to.be.an('object');
            expect(response.message).to.be.equal("Hello World");
            expect(response.location).to.be.an("string");
        });
    });
});

