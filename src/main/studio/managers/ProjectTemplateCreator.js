import * as dns from 'dns';
import * as fs from 'fs';
import { TEMPLATES } from '../../../contents';
import { join } from 'path';
import { app } from 'electron';
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
    try {
      const resolveDNS = promisify(dns.resolve);
      await resolveDNS('www.github.com');
      return await this.createFrom('github', type, location);
    }
    catch (err) {
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
    return new Promise(resolve => {
      const session = this.studio.window.webContents.session;

      session.on('will-download', (event, item, webContents) => {
        const path = join(this.tempDir, 'template.zip');
        item.setSavePath(path);

        item.once('done', (event, state) => {
          if (state === 'completed') {
            resolve(path);
          }
          else {
            // If download fails, fallback to the local archive.
            resolve(this.getTemplateZip('file', type));
          }
        });
      });
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

      unzipper.on('error', (log) => {
        reject('Failed to extract template.');
      });
      unzipper.on('progress', (fileIndex, fileCount) => {
        // TODO - Show extraction progress?
      });
      unzipper.on('extract', (log) => {
        resolve();
      });

      unzipper.extract({ path: join(this.tempDir, 'decompressed') });
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

      const copy = promisify(ncp);
      await copy(path, location);

      const remove = promisify(rimraf);
      await remove(this.tempDir);

      return { success: true };
    }
    catch (err) {
      return { err };
    }
  }
}