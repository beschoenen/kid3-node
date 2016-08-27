let { exec, execSync } = require('child_process');

/**
 * @class Kid3Builder
 * @param {String} [binary] - The path to the kid3-cli binary
 *
 * @returns {Kid3Builder}
 */
class Kid3Builder {

    /**
     * @param {String} [binary=kid3-cli] - The path to the kid3-cli binary
     */
    constructor(binary = 'kid3-cli') {
        this.binary = binary;
        this._commands = [];
    }

    /**
     * @private Method
     *
     * Combine the commands to form one command
     * @param {String} [filepath]
     *
     * @returns {String}
     */
    _buildCommand(filepath) {
        if(this._commands.length < 1) {
            throw new Error("Please add some commands first.");
        }

        var line = this._commands.map(item => `-c ${item}`).join(' ');

        if(filepath) {
            line += ` "${filepath}"`
        }

        return line;
    }

    /**
     * Run the command
     * @param {Function} callback
     * @param {String} [filepath]
     *
     * @returns {void}
     */
    run(callback, filepath) {
        exec(`${this.binary} ${this._buildCommand(filepath)}`, { encoding: 'utf8' }, callback);
    }

    /**
     * Run the command sync
     * @param {String} [filepath]
     *
     * @returns {String} - The output
     */
    runSync(filepath) {
        return execSync(`${this.binary} ${this._buildCommand(filepath)}`, { encoding: 'utf8' });
    }

    /**
     * Start Kid3-cli methods
     */

    /**
     * Displays help about the parameters of COMMAND-NAME or about all commands if no command name is given.
     * @param {String} [command] - The command to display help for
     *
     * @returns {Kid3Builder}
     */
    help(command = '') {
        this._commands.push(`"help ${command}"`);
        return this;
    }

    /**
     * Overwrite the default command timeout.
     * The CLI commands abort after a command specific timeout is expired.
     * This timeout is 10 seconds for ls and albumart, 60 seconds for autoimport and filter, and 3 seconds for all
     * other commands. If a huge number of files has to be processed, this timeouts may be too restrictive, thus
     * the timeout for all commands can be set to TIME ms, switched off altogether or be left at the default values.
     * @param {String|Number} [value=default] - [ default | off | TIME ]
     *
     * @returns {Kid3Builder}
     */
    timeout(value = 'default') {
        this._commands.push(`"timeout '${value}'"`);
        return this;
    }

    /**
     * Exit application.
     * If there are modified unsaved files, the force parameter is required.
     * @param {Boolean} [force=false] - If to force exit the shell
     *
     * @returns {Kid3Builder}
     */
    exit(force = false) {
        this._commands.push(`"exit ${force ? 'force': ''}"`);
        return this;
    }

    /**
     * Change directory.
     * If no DIRECTORY is given, change to the home directory. If a directory is given, change into the directory.
     * If one or more file paths are given, change to their common directory and select the files.
     * @param {String} [directory] - The directory to change to
     *
     * @returns {Kid3Builder}
     */
    cd(directory = '') {
        directory = directory.replace(/(\\|\/)$/, '');
        this._commands.push(`"cd ${directory ? `'${directory}'` : directory}"`);

        return this;
    }

    /**
     * Print the filename of the current working directory.
     *
     * @returns {Kid3Builder}
     */
    pwd() {
        this._commands.push('pwd');
        return this;
    }

    /**
     * List the contents of the current directory. This corresponds to the file list in the Kid3 GUI.
     * Four characters before the file names show the state of the file.
     *  > File is selected.
     *  * File is modified.
     *  1 File has a tag 1, otherwise '-' is displayed.
     *  2 File has a tag 2, otherwise '-' is displayed.
     *
     * @returns {Kid3Builder}
     */
    ls() {
        this._commands.push('ls');
        return this;
    }

    /**
     * Save the changes that were made.
     *
     * @returns {Kid3Builder}
     */
    save() {
        this._commands.push('save');
        return this;
    }

    /**
     * To select all files, enter select all, to deselect all files, enter select none.
     * To traverse the files in the current directory start with select first,
     * then go forward using select next or backward using select previous.
     * Specific files can be added to the current selection by giving their file names.
     * Wildcards are possible, so select *.mp3 will select all MP3 files in the current directory.
     * @param {String} filename - [ all | none | first | previous | next | FILE... ]
     *
     * @returns {Kid3Builder}
     */
    selectFile(filename) {
        this._commands.push(`"select '${filename}'"`);
        return this;
    }

    /**
     * Many commands have an optional TAG-NUMBERS parameter, which specifies whether the command operates
     * on tag 1 or tag 2.
     * If this parameter is omitted, the default tag numbers are used, which can be set by this command.
     * At startup, is is set to 12 which means that information is read from tag 2 if available,
     * else from tag 1; modifications are done on tag 2. The TAG-NUMBERS can be set to 1 or 2
     * to operate only on the corresponding tag. If the parameter is omitted, the current setting is displayed.
     * @param {Number} [number=12] - The tag number to select
     *
     * @returns {Kid3Builder}
     */
    selectTag(number = 12) {
        this._commands.push(`"tag ${number}"`);
        return this;
    }

    /**
     * Get a list of all tags in the file
     *
     * @returns {Kid3Builder}
     */
    getTags() {
        this._commands.push('tag');
        return this;
    }

    /**
     * This command can be used to read the value of a specific tag frame or get information about all tag frames
     * (if the argument is omitted or all is used).
     * Modified frames are marked with a '*'.
     * @param {String} [column=all] - The column to select
     * @param {Number} [tag=12]
     *
     * @returns {Kid3Builder}
     */
    getTagFrame(column = 'all', tag = 12) {
        this._commands.push(`"get '${column}' ${tag}"`);
        return this;
    }

    /**
     * To save the contents of a picture frame to a file.
     * @param {String} path - The path to save the picture to
     *
     * @returns {Kid3Builder}
     */
    getPicture(path) {
        this._commands.push(`"get picture:'${path}'"`);
        return this;
    }

    /**
     * To save synchronized lyrics to an LRC file.
     * @param {String} path - The path to save the lyrics to
     *
     * @returns {Kid3Builder}
     */
    getLyrics(path) {
        this._commands.push(`"get SYLT:'${path}'"`);
        return this;
    }

    /**
     * This command sets the value of a specific tag frame.
     * @param {String} name - The key
     * @param {String} [value]- The value
     * @param {Number} [tag=12] - The tag number
     *
     * @returns {Kid3Builder}
     */
    setTagFrame(name, value = '', tag = 12) {
        this._commands.push(`"set '${name}' '${value}' ${tag}"`);
        return this;
    }

    /**
     * To set the contents of a picture frame from a file.
     * @param {String} path - The path of the picture to load
     * @param {String} [description=Cover] - The description for the picture
     *
     * @returns {Kid3Builder}
     */
    setPicture(path, description = 'Cover') {
        this._commands.push(`"set picture:'${path}' '${description}'"`);
        return this;
    }

    /**
     * To set synchronized lyrics from an LRC file
     * @param {String} path - The path fo the lyrics to load
     * @param {String} [description=] - The description for the lyrics
     * @returns {Kid3Builder}
     */
    setLyrics(path, description = '') {
        this._commands.push(`"set SYLT:'${path}' '${description}'"`);
        return this;
    }

    /**
     * Revert all modifications in the selected files (or all files if no files are selected).
     *
     * @returns {Kid3Builder}
     */
    revert() {
        this._commands.push('revert');
        return this;
    }

    /**
     * Tags are imported from the file FILE (or from the clipboard if clipboard is used for FILE) in the format
     * with the name FORMAT-NAME (e.g. "CSV unquoted", see Import).
     * If tags is given for FILE, tags are imported from other tags.
     * Instead of FORMAT-NAME parameters SOURCE and EXTRACTION are required, see Import from Tags.
     * @param {String} file - The path to the file to import or clipboard [ clipboard | FILE ]
     * @param {String} format - The format of the file e.g. "CSV unquoted", check docs
     * @param {Number} [tag=12]
     *
     * @returns {Kid3Builder}
     */
    import(file, format, tag = 12) {
        this._commands.push(`"import '${file}' '${format}' ${tag}"`);
        return this;
    }

    /**
     * Batch import using profile PROFILE-NAME (see Automatic Import, "All" is used if omitted).
     * @param {String} [profile=all] - The profile to use for autoimport [ All | MusicBrainz | Discogs | Cover Art ]
     * @param {Number} [tag=12]
     *
     * @returns {Kid3Builder}
     */
    autoimport(profile = 'all', tag = 12) {
        this._commands.push(`"autoimport '${profile}' ${tag}"`);
        return this;
    }

    /**
     * Set the album artwork by downloading a picture from URL. The rules defined in the Browse Cover Art dialog
     * are used to transform general URLs (e.g. from Amazon) to a picture URL.
     * To set the album cover from a local picture file, use the set command.
     * @param {String} url - The url to the picture
     * @param {String} [all] - [ all | ]
     *
     * @returns {Kid3Builder}
     */
    albumart(url, all = '') {
        this._commands.push(`"albumart '${url}' ${all}"`);
        return this;
    }

    /**
     * Tags are exported to file FILE (or to the clipboard if clipboard is used for FILE)
     * in the format with the name FORMAT-NAME (e.g. "CSV unquoted", see Export).
     * @param {String} file - The path to the file to import or clipboard [ clipboard | FILE ]
     * @param {String} format - The format of the file e.g. "CSV unquoted", check docs
     * @param {Number} tag
     * @returns {Kid3Builder}
     */
    export(file, format, tag = 12) {
        this._commands.push(`"export '${file}' '${format}' ${tag}"`);
        return this;
    }

    /**
     * Create playlist in the format set in the configuration, see Create Playlist.
     *
     * @returns {Kid3Builder}
     */
    playlist() {
        this._commands.push('playlist');
        return this;
    }

    /**
     * Apply file name format set in the configuration, see Apply Filename Format.
     *
     * @returns {Kid3Builder}
     */
    filenameformat() {
        this._commands.push('filenameformat');
        return this;
    }

    /**
     * Apply tag name format set in the configuration, see Apply Tag Format.
     *
     * @returns {Kid3Builder}
     */
    tagformat() {
        this._commands.push('tagformat');
        return this;
    }

    /**
     * Apply text encoding set in the configuration, see Apply Text Encoding.
     *
     * @returns {Kid3Builder}
     */
    textencoding() {
        this._commands.push('textencoding');
        return this;
    }

    /**
     * Rename or create directories from the values in the tags according to a given FORMAT
     * (e.g. %{artist} - %{album}, see Rename Directory), if no format is given,
     * the format defined in the Rename directory dialog is used.
     * The default mode is rename; to create directories, create must be given explicitly.
     * The rename actions will be performed immediately, to just see what would be done, use the dryrun option.
     * @param {String} format - The format for the folder
     * @param {String} type - [ create | rename | dryrun ]
     * @param {Number} [tag=12]
     *
     * @returns {Kid3Builder}
     */
    renamedir(format, type, tag = 12) {
        this._commands.push(`"renamedir '${format}' ${type} ${tag}"`);
        return this;
    }

    /**
     * Number the selected tracks starting with TRACK-NUMBER (1 if omitted).
     * @param {Number} [trackNumber] - The number of the tracks to select
     * @param {Number} [tag=12]
     *
     * @returns {Kid3Builder}
     */
    numbertracks(trackNumber, tag = 12) {
        this._commands.push(`"numbertracks '${trackNumber}' ${tag}"`);
        return this;
    }

    /**
     * Filter the files so that only the files matching the FILTER-FORMAT are visible.
     * The name of a predefined filter expression
     * (e.g. "Filename Tag Mismatch") can be used instead of a filter expression, see Filter.
     * @param {String} filter - The filter name or filter format
     *
     * @returns {Kid3Builder}
     */
    filter(filter) {
        this._commands.push(`filter "${filter}"`);
        return this;
    }

    /**
     * Convert the selected tag number to ID3 V2.4
     *
     * @returns {Kid3Builder}
     */
    to24() {
        this._commands.push('to24');
        return this;
    }

    /**
     * Convert the selected tag number to ID3 V2.3
     *
     * @returns {Kid3Builder}
     */
    to23() {
        this._commands.push('to23');
        return this;
    }

    /**
     * Set the file names of the selected files from values in the tags,
     * for example fromtag "%{track} - %{title}" 1. If no format is specified, the format set in the GUI is used.
     * @param {String} format - The format to use for the rename
     * @param {Number} [tag=12]
     *
     * @returns {Kid3Builder}
     */
    fromtag(format, tag = 12) {
        this._commands.push(`"fromtag '${format}' ${tag}"`);
        return this;
    }

    /**
     * Set the tag frames from the file names,
     * for example totag "%{albumartist} - %{album}/%{track} %{title}" 2.
     * If no format is specified, the format set in the GUI is used.
     * If the format of the filename does not match this pattern, a few other commonly used formats are tried.
     * @param {String} format - The format of the filename
     * @param {Number} [tag=12]
     *
     * @returns {Kid3Builder}
     */
    totag(format, tag = 12) {
        this._commands.push(`"totag '${format}' ${tag}"`);
        return this;
    }

    /**
     * Copy the tag frames from one tag to the other tag, e.g. to set the ID3v2 tag from the ID3v1 tag, use syncto 2.
     * @param {Number} tag
     *
     * @returns {Kid3Builder}
     */
    syncto(tag) {
        this._commands.push(`"syncto ${tag}"`);
        return this;
    }

    /**
     * Copy the tag frames of the selected file to the internal copy buffer.
     * They can then be set on another file using the paste command.
     * @param {Number} [tag=12]
     *
     * @returns {Kid3Builder}
     */
    copy(tag = 12) {
        this._commands.push(`"copy ${tag}"`);
        return this;
    }

    /**
     * Set tag frames from the contents of the copy buffer in the selected files.
     * @param {Number} [tag=12]
     *
     * @returns {Kid3Builder}
     */
    paste(tag = 12) {
        this._commands.push(`"paste ${tag}"`);
        return this;
    }

    /**
     * Remove a tag.
     * @param {Number} tag
     *
     * @returns {Kid3Builder}
     */
    remove(tag) {
        this._commands.push(`"remove ${tag}"`);
        return this;
    }

    /**
     * Start audio playback. Once it has been started,
     * it can be controlled with the pause (to pause and resume), stop, previous and next options.
     * @param {String} [command] - [ pause | stop | previous | next ]
     *
     * @returns {Kid3Builder}
     */
    play(command = '') {
        this._commands.push(`"play ${command}"`);
        return this;
    }
}

module.exports = Kid3Builder;
