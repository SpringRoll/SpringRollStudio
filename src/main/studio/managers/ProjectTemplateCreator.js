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
   * @param {string} type
   * @param {string} location
   * @returns
   * @memberof ProjectTemplateCreator
   */
  create(type, location) {
    return new Promise((resolve, reject) => {
      dns.resolve('www.github.com', (err) => {
        if (err) {
          this.createFrom('file', type, location)
            .then(resolve)
            .catch(reject);
        }
        else {
          this.createFrom('github', type, location)
            .then(resolve)
            .catch(reject);
        }
      });
    });
  }

  /**
   *
   * @param {string} from
   * @param {string} type
   * @param {string} location
   * @memberof ProjectTemplateCreator
   */
  createFrom(from, type, location) {
    return new Promise((resolve, reject) => {
      this.getTemplateZip(from, type).then((path) => {
        if (path === undefined) {
          reject();
        }
        this.extractTemplateFiles(path).then(() => {
            this.copyTemplateFilesTo(location)
              .then(resolve)
              .catch(reject);
          }).catch(reject);
      });
    });
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
      return await this.downloadTemplateZip(url);

    case 'file':
      return url;
    }
  }

  /**
   *
   * @param {string} url
   * @returns
   * @memberof ProjectTemplateCreator
   */
  downloadTemplateZip(url) {
    return new Promise((resolve, reject) => {
      const session = this.studio.window.webContents.session;

      session.on('will-download', (event, item, webContents) => {
        const path = join(this.tempDir, 'template.zip');
        item.setSavePath(path);

        item.once('done', (event, state) => {
          if (state === 'completed') {
            resolve(path);
          }
          else {
            reject();
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
        reject();
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
  copyTemplateFilesTo(location) {
    return new Promise((resolve, reject) => {
      try {
        const decompressed = join(this.tempDir, 'decompressed');
        const files = fs.readdirSync(decompressed);
        // This path points into the leading folder from the zip file.
        // Everything we need to copy is inside that leading folder.
        const path = join(decompressed, files[0]);

        const copy = promisify(ncp);
        copy(path, location).then(() => {
          const remove = promisify(rimraf);
          remove(this.tempDir)
            .then(resolve)
            .catch(reject);
        }).catch(reject);
      }
      catch (e) {
        console.log(e);
        reject();
      }
      resolve();
    });
  }
}