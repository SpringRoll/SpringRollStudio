import * as dns from 'dns';
import * as fs from 'fs';
import { TEMPLATES } from '../../../contents';
import { join } from 'path';
import { app, webContents } from 'electron';
import DecompressZip from 'decompress-zip';
import ncp from 'ncp';
import { promisify } from 'util';
import rimraf from 'rimraf';

/**
 *
 * @class ProjectTemplateCreator
 */
export default class ProjectTemplateCreator {
  /**
   * Creates an instance of ProjectTemplateCreator.
   * @param {string} studio
   * @memberof ProjectTemplateCreator
   */
  constructor(studio) {
    this.studio = studio;
    this.tempDir = join(app.getPath('userData'), 'tmp/');
  }

  /**
   *
   * @param {string[]} msg
   * @memberof ProjectTemplateCreator
   */
  log(...msg) {
    if (this.logger) {
      this.logger(msg.join(" "));
    }
    else {
      console.log(msg.join(" "));
    }
  }

  /**
   *
   * @param {*} location
   * @memberof ProjectTemplateCreator
   */
  isLocationEmpty(location) {
    if (!fs.existsSync(location)) {
      return true;
    }
    try {
      const files = fs.readdirSync(location);
      return files.length === 0;
    }
    catch (e) {
      return false;
    }
  }

  /**
   *
   * @param {string} type
   * @param {string} location
   * @returns
   * @memberof ProjectTemplateCreator
   */
  async create(type, location) {
    if (!this.isLocationEmpty(location)) {
      return { err: 'New project location must be empty.' };
    }

    this.log(`Beginning ${type} template project creation:`);

    try {
      const resolveDNS = promisify(dns.resolve);

      this.log("Attempting to reach www.github.com.");

      await resolveDNS('www.github.com');
      return await this.createFrom('github', type, location);
    }
    catch (err) {
      this.log("Could not reach www.github.com. Falling back to local template archives.");

      return await this.createFrom('file', type, location);
    }
  }

  /**
   *
   * @param {string} from
   * @param {string} type
   * @param {string} location
   * @memberof ProjectTemplateCreator
   */
  async createFrom(from, type, location) {
    const path = await this.getTemplateZip(from, type);
    try {
      await this.extractTemplateFiles(path);
      return await this.copyTemplateFilesTo(location);
    }
    catch (err) {
      this.log('Failed to create new template project.');

      return { err };
    }
  }

  /**
   *
   * @param {string} from
   * @param {string} type
   * @memberof ProjectTemplateCreator
   */
  async getTemplateZip(from, type) {
    const url = TEMPLATES[from][type];
    switch (from) {
    case 'github':
      return await this.downloadTemplateZip(url, type);

    case 'file':
      if (process.env.NODE_ENV === 'production') {
        return join(process.resourcesPath, url);
      }
      return join(__dirname, '../', url);
    }
  }

  /**
   *
   * @param {string} url
   * @returns
   * @memberof ProjectTemplateCreator
   */
  downloadTemplateZip(url, type) {
    this.log(`Downloading ${type} template files from ${url}`);

    return new Promise(resolve => {
      const session = this.studio.window.webContents.session;

      const willDownload = (event, item, webContents) => {
        const path = join(this.tempDir, 'template.zip');
        item.setSavePath(path);

        item.once('done', (event, state) => {
          session.off('will-download', willDownload);

          if (state === 'completed') {
            this.log('Download complete successful.')

            resolve(path);
          }
          else {
            this.log('Failed to download template file from GitHub. Falling back to local archives.');

            // If download fails, fallback to the local archive.
            resolve(this.getTemplateZip('file', type));
          }
        });
      };
      session.on('will-download', willDownload);

      session.downloadURL(url);
    });
  }

  /**
   *
   * @param {string} source
   * @returns
   * @memberof ProjectTemplateCreator
   */
  extractTemplateFiles(source) {
    return new Promise((resolve, reject) => {
      const unzipper = new DecompressZip(source);
      const extractLocation = join(this.tempDir, 'decompressed');

      unzipper.on('error', (log) => {
        this.log('Failed to extract template files.');

        reject('Failed to extract template.');
      });
      unzipper.on('progress', (fileIndex, fileCount) => {
        this.log(`Extracting progress: ${Math.ceil(((fileIndex + 1) / fileCount) * 100)}%`)
      });
      unzipper.on('extract', (log) => {
        this.log('Extracting complete');

        resolve();
      });

      this.log(`Extracting template files to ${extractLocation}`);

      unzipper.extract({ path: extractLocation });
    });
  }

  /**
   *
   * @param {string} location
   * @memberof ProjectTemplateCreator
   */
  async copyTemplateFilesTo(location) {
    const decompressed = join(this.tempDir, 'decompressed');

    try {
      const readDir = promisify(fs.readdir);
      const files = await readDir(decompressed);

      const path = join(decompressed, files[0]);

      this.log(`Copying template files to ${location}`);

      const copy = promisify(ncp);
      await copy(path, location);

      this.log(`Cleaning up temp folder.`);

      const remove = promisify(rimraf);
      await remove(this.tempDir);

      this.log('Project creation complete.')

      return { success: true };
    }
    catch (err) {
      this.log('Failed to copy template files.');

      return { err };
    }
  }
}