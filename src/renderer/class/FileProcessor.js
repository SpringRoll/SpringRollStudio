import Directory from './Directory';
import store from '../store/';
import { EventBus } from '../class/EventBus';
const fs = require('fs');
const path = require('path');
const FileType = require('file-type');

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
   * @constructor
   * @param {Object} options
   * @param {RegExp} options.fileFilter
   * @param {RegExp|string} options.nameFilter
   */
  constructor(
    { fileFilter = /(audio\/(mp3|ogg|mpeg)|video\/ogg)$/, nameFilter = '' } = {}
  ) {
    this.clear();
    this.fileFilter = fileFilter;
    this.setNameFilter(nameFilter);
    this.directory = new Directory();
    this.hasFiles = false;
    this.parentDirectoryName = store.state.captionInfo.audioLocation !== undefined ? path.basename(store.state.captionInfo.audioLocation) : '';
  }

  /**
   * Processes a file list and returns a Directory containing all the files and nested directories to properly simulate the local directory
   * @returns Promise<Directory>
   * @memberof FileProcessor
   * @async
   */
  async generateDirectories() {
    this.parentDirectoryName = store.state.captionInfo.audioLocation !== undefined ? path.basename(store.state.captionInfo.audioLocation) : '';

    this.clear();

    const files = await this.generateFileList(store.state.captionInfo.audioLocation);
    EventBus.$emit('file_list_generated', files);

    for (let i = 0, l = files.length; i < l; i++) {
      if (
        this.fileFilter.test(files[i].type.mime) &&
        this.nameFilter.test(files[i].name)
      ) {
        this.directory.addFile(files[i]);
        this.hasFiles = true;
      }
    }

    return this.directory;
  }

  /**
   * Grabs every file in the given directory path and formats it into an array of usable File-like objects
   * @param {string} dirPath full path to directory
   * @param {Object[]} [arrayOfFiles] array of prevoiously created file objects. Mostly used for recursive calls
   * @returns Promise<Object[]>
   * @memberof FileProcessor
   * @async
   */
  async generateFileList(dirPath, arrayOfFiles = []) {
    if (dirPath === undefined) {
      return arrayOfFiles;
    }
    const fileList = fs.readdirSync(dirPath, { withFileTypes: true });

    for (let i = 0, l = fileList.length; i < l; i++) {
      if (fileList[i].isDirectory()) {
        arrayOfFiles = await this.generateFileList(path.join(dirPath, fileList[i].name), arrayOfFiles);
      } else {
        const type = await FileType.fromFile(path.join(dirPath, fileList[i].name));
        if (type) {
          arrayOfFiles.push({
            name: fileList[i].name,
            fullPath: path.join(dirPath, fileList[i].name),
            relativePath: path.join('' + this.parentDirectoryName, path.relative(store.state.captionInfo.audioLocation, path.join(dirPath, fileList[i].name))),
            type,
          });
        }
      }
    }
    return arrayOfFiles;
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
