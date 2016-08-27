let Kid3Builder = require('../helper');
let os = require("os");
let { normalize } = require('path');

exports.cdHome = function(test) {
    let builder = new Kid3Builder();

    test.expect(1);

    let result = builder.cd().pwd().runSync();

    test.equal(
        normalize(result.trim()),
        os.homedir(),
        "The result should be the home directory"
    );

    test.done();
};

exports.cdToFolder = function(test) {
    let builder = new Kid3Builder();

    test.expect(1);

    let result = builder.cd(__dirname).pwd().runSync();

    test.equal(
        normalize(result.trim()),
        __dirname,
        "The result should be this folder"
    );

    test.done();
};
