import { autoUpdater } from 'electron-updater';
import log from 'electron-log';

class AppUpdater {
  get state () {
    return this._state;
  }

  constructor () {
    this._state = '';

    autoUpdater.logger = log;
    autoUpdater.logger.transports.file.level = 'info';

    autoUpdater.on('checking-for-update', () => {
      this._state = 'checking';
    });
    autoUpdater.on('update-available', () => {
      this._state = 'available';
    });
    autoUpdater.on('update-not-available', () => {
      this._state = 'notavailable';
    });
    autoUpdater.on('error', () => {
      this._state = 'error';
    });
    autoUpdater.on('update-downloaded', () => {
      this._state = 'downloaded';
    });

    // setInterval(() => {
    //   console.log(this.state);
    // }, 1000);
  }

  checkForUpdate () {
    autoUpdater.checkForUpdates();
    // return new Promise((resolve, reject) => {

    // });
  }

  quitAndInstall () {
    autoUpdater.quitAndInstall();
  }
}

export const appUpdater = new AppUpdater();
