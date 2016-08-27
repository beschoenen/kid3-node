let Kid3Builder = require('../helper');
let Kid3 = require('../../bin/Kid3');
let fs = require("fs");

exports.ls = function(test) {
    let builder = new Kid3Builder();

    test.expect(1);

    let result = builder.cd(`${__dirname}/../env`).ls().runSync();

    test.deepEqual(
        Kid3.parseDirectoryListOutput(result),
        fs.readdirSync(`${__dirname}/../env`),
        "The result should have the same files"
    );

    test.done();
};
