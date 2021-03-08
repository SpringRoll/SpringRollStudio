import Directory from './Directory';

/**
 * @typedef FileProcessorOptions
 * @property {RegExp} fileFilter
 * @property {string} nameFilter
 *
 *
 * @export
 * @class FileProcessor
 * @property {Directory} directory
 * @property {RegExp} fileFilter
 * @property {RegExp} nameFilter
 * @param {FileList} files
 * @param {FileProcessorOptions} options
 */
class FileProcessor {
  /**
   *
   * @param {*} files
   * @param {*} param1
   */
  constructor(
    files = null,
    { fileFilter = /(audio\/(mp3|ogg|mpeg)|video\/ogg)$/, nameFilter = '' } = {}
  ) {
    this.clear();
    this.fileFilter = fileFilter;
    this.setNameFilter(nameFilter);
    this.generateDirectories(files);
    this.directory = new Directory();
    this.hasFiles = false;
  }

  /**
   * Processes a file list and returns a Directory containing all the files and nested directories to properly simulate the local directory
   * @param {FileList} files
   * @returns Directory
   * @memberof FileProcessor
   */
  generateDirectories(files) {
    if (!(files instanceof FileList)) {
      return;
    }
    this.clear();

    for (let i = 0, l = files.length; i < l; i++) {
      if (
        this.fileFilter.test(files[i].type) &&
        this.nameFilter.test(files[i].name)
      ) {
        this.directory.addFile(files[i]);
        this.hasFiles = true;
      }
    }
    return this.directory;
  }

  /**
   * Clears the current Directory instance
   * @memberof FileProcessor
   */
  clear() {
    this.directory = new Directory();
    this.hasFiles = false;
  }

  /**
   * Updates the filter applied to file names
   * @param {string} name
   * @memberof FileProcessor
   */
  setNameFilter(name) {
    if (!name.length) {
      this.nameFilter = /^/g;
      return;
    }
    this.nameFilter = new RegExp(`(${name})`, 'g');
  }

  /**
   *
   */
  getDirectory() {
    return this.directory;
  }
}

export default new FileProcessor();
