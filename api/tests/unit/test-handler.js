'use strict';

const app = require('../../app.js');
const chai = require('chai');
const expect = chai.expect;
let event, context;


describe('Tests index', function () {
    it('verifies successful response', async () => {
        const result = await app.hello(event, context)

        expect(result).to.be.an('object');
        expect(result.statusCode).to.equal(200);
        expect(result.body).to.be.an('string');

        let response = JSON.parse(result.body);

        expect(response).to.be.an('object');
        expect(response.message).to.be.equal("Hello, this is v2");
        expect(response.location).to.be.an("string");
    });
});

