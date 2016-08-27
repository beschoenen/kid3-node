let Kid3Builder = require('./Kid3Builder');
let path = require('path');

const endOfLine = require('os').EOL;

/**
 * @class Kid3
 */
class Kid3 {

    /**
     * @constructor Class constructor
     * @param {String} [binary] - The location for the kid3-cli binary
     */
    constructor(binary) {
        this._binary = binary;
    }

    /**
     * @private Method
     *
     * Make a new Kid3Builder
     *
     * @returns {Kid3Builder}
     */
    _commandBuilder() {
        return new Kid3Builder(this._binary);
    }

    /**
     * Get a list of tags in the file
     * @param {String} filepath - The path to the file
     *
     * @returns {Array} - List of tag numbers
     */
    listTagNumbers(filepath) {
        return this._commandBuilder().getTags().runSync(filepath)
            .match(/\s([0-9,\s]+)/)[0].trim().split(',')
            .map(item => parseInt(item));
    }

    /**
     * Get tags for a file
     * @param {string} filepath
     * @param {Array|string} [columns] - The columns to select; default is all
     * @param {Number} [tag] - The tag number to select
     *
     * @returns {Object} - The tags
     */
    getTags(filepath, columns, tag) {
        let result = Kid3.parseTagFrameOutput(
            this._commandBuilder().getTagFrame(columns, tag).runSync(filepath)
        );

        return result.tags[result.tags['2'] ? '2' : '1'];
    }

    /**
     * Save tags to a file
     * @param {Object} tags - The tags to save (Key:Value pair)
     * @param {string} filepath
     *
     * @returns {void}
     */
    setTags(tags, filepath) {
        var builder = this._commandBuilder();

        for(var tag in tags) {
            if(tags.hasOwnProperty(tag)) {
                builder.setTagFrame(tag, tags[tag]);
            }
        }

        builder.save().runSync(filepath);
    }

    /**
     * Copy tags from 1 file to another
     * @param {String} from - The filepath for the source file
     * @param {String} to - The filepath for the target file
     * @param {Number} [fromTag] - The tag number of the source file
     * @param {Number} [toTag] - The tag number of the target file
     *
     * @returns {void}
     */
    copyTags(from, to, fromTag, toTag) {
        this._commandBuilder()
            .cd(from.replace(path.basename(from), ''))
            .selectFile(path.basename(from))
            .copy(fromTag)
            .cd(to.replace(path.basename(to), ''))
            .selectFile(path.basename(to))
            .paste(toTag)
            .save()
            .runSync();
    }

    /**
     * Parse the string of tag output to json
     * @param {String} tagFrameOutput - The output
     *
     * @TODO refactor
     *
     * @returns {Object} - The parsed tags
     */
    static parseTagFrameOutput(tagFrameOutput) {
        var header,
            output = { file: {}, tags: {} };

        tagFrameOutput.split(endOfLine).filter(line => !!line).forEach(line => {
            // If header
            if(!/^  .*/.test(line)) {
                let fileMatches = line.match(/File:\s(.*)\s([0-9]{2,}\sHz)\s(.*)\s([0-9:]{4,})/);
                if(fileMatches) {
                    header = 'file';
                    output.file = {
                        tag: fileMatches[1],
                        frequency: fileMatches[2],
                        channels: fileMatches[3],
                        duration: fileMatches[4]
                    };
                    return true;
                }

                let tagMatches = line.match(/Tag\s([0-9]+):\s(.*)/);
                if(tagMatches) {
                    header = tagMatches[1];
                    output.tags[header] = {};
                }
            } else if(!header || header != 'file') {
                let matches = line.match(/^ {2}((?:(?!\s{2}).)+)  +(.+)/);
                if(matches) {
                    output.tags[header][matches[1]] = matches[2];
                }
            }
        });

        return output;
    }

    /**
     * Parse the string of ls output to an array
     * @param directoryListOutput - The output
     *
     * @returns {Array} - List of files
     */
    static parseDirectoryListOutput(directoryListOutput) {
        var output = [];

        directoryListOutput.split(endOfLine).filter(line => !!line).forEach(line => {
            var match = line.match(/(?:[> ])?(?:[* ])(?:[1\- ])(?:[2\- ])-? (.*)/);
            if(match) {
                output.push(match[1]);
            }
        });

        return output;
    }
}

module.exports = Kid3;
