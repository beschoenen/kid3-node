let Kid3Builder = require('../helper');

exports.withoutCommands = function(test) {
    let builder = new Kid3Builder();

    test.expect(1);

    test.throws(
        () => builder.runSync(),
        'Please add some commands first.',
        "The result should throw an exception"
    );

    test.done();
};

exports.buildCommand = function(test) {
    let builder = new Kid3Builder();

    test.expect(1);

    let result = builder.pwd()._buildCommand();

    test.equal(
        result,
        '-c pwd',
        "The result should be the compiled command string"
    );

    test.done();
};

exports.withFilename = function(test) {
    let builder = new Kid3Builder();

    test.expect(1);

    let result = builder.pwd()._buildCommand('Song.mp3');

    test.equal(
        result,
        '-c pwd "Song.mp3"',
        "The result should be the compiled command string with filename"
    );

    test.done();
};
