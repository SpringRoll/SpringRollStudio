import { resolve } from 'path';

import { ipcMain, dialog } from 'electron';
import { EVENTS, DIALOGS } from '../../contants';
import { projectInfo, gamePreview } from './storage';

/**
 * Main application Singleton. This object is responsible for setting up logic specific to SpringRoll Studio.
 * @class SpringRollStudio
 */
class SpringRollStudio {
  /**
   * Initialize SpringRoll Studio.
   * @memberof SpringRollStudio
   */
  initialize(window) {
    this.window = window;
    this.setupListeners();
  }

  /**
   * Wire up all studio level event listeners.
   * @memberof SpringRollStudio
   */
  setupListeners() {
    ipcMain.on(EVENTS.OPEN_DIALOG, this.openDialog.bind(this));
    ipcMain.on(EVENTS.CREATE_PROJECT_TEMPLATE, this.createProjectTemplate.bind(this));
    ipcMain.on(EVENTS.OPEN_CAPTION_STUDIO, this.openCaptionStudio.bind(this));
    ipcMain.on(EVENTS.PREVIEW_TARGET_SET, this.previewTargetSet.bind(this));
  }

  /**
   * Handler for the EVENTS.OPEN_DIALOG event.
   * @param {string} type
   * @memberof SpringRollStudio
   * @private
   */
  openDialog(event, type) {
    if (typeof type !== 'string') {
      throw new Error(`[Studio] Invalid dialog type. Expected string. [type = ${typeof type}]`);
    }

    switch (type) {
    case DIALOGS.PROJECT_LOCATION_SETTER:
      const options = {
        title: 'Select SpringRoll Project',
        defaultPath: projectInfo.location,
        properties: ['openDirectory']
      };

      const paths = dialog.showOpenDialogSync(this.window, options);
      if (paths !== undefined) {
        projectInfo.location = paths[0];
      }
      break;

    default:
      throw new Error(`[Studio] Unrecognized dialog type. [type = ${type}]`);
    }
  }

  /**
   * Handler for EVENTS.CREATE_PROJECT_TEMPLATE event.
   * @memberof SpringRollStudio
   */
  createProjectTemplate() {
    console.log('[createProjectTemplate] Missing implementation');
  }

  /**
   * Handler for EVENTS.OPEN_CAPTION_STUDIO event.
   * @memberof SpringRollStudio
   */
  openCaptionStudio() {
    console.log('[openCaptionStudio] Missing implementation');
  }

  /**
   *Handler for the EVENTS.PREVIEW_TARGET_SET event.
   * @memberof SpringRollStudio
   */
  previewTargetSet(event, data) {
    gamePreview.previewTarget = data.type;

    switch(data.type) {
    case 'deploy':
      gamePreview.previewURL = resolve(projectInfo.location, 'deploy');
      break;

    case 'url':
      gamePreview.previewURL = data.url
      break;
    }
  }
}

/**
 * Export the singleton instance of SpringRoll Studio.
 */
export const studio = new SpringRollStudio();