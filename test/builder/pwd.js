let Kid3Builder = require('../helper');
let { normalize } = require('path');

exports.pwd = function(test) {
    let builder = new Kid3Builder();

    test.expect(1);

    let result = builder.pwd().runSync();

    test.ok(
        normalize(__dirname).indexOf(
            normalize(result.trim())
        ) > -1,
        "The PWD should be the current directory"
    );

    test.done();
};
