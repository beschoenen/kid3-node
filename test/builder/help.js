let Kid3Builder = require('../helper');
const endOfLine = require('os').EOL;

exports.helpFullList = function(test) {
    let builder = new Kid3Builder();

    test.expect(2);

    let result = builder.help().runSync();

    test.ok(
        result.indexOf('Parameter') > -1,
        "The result should contain \"Parameter\""
    );

    test.ok(
        result.indexOf('Available Commands') > -1,
        "The result should contain \"Available Commands\""
    );

    test.done();
};

exports.helpOneCommand = function(test) {
    let builder = new Kid3Builder();

    test.expect(2);

    let result = builder.help('help').runSync();

    test.ok(
        result.split(endOfLine).filter(line => !!line).length === 2,
        "The result should be 2 lines long"
    );

    test.ok(
        result.indexOf('help [S]  Help') > -1,
        "The result should contain \"help\""
    );

    test.done();
};
