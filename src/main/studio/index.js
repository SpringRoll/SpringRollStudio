import { resolve, join } from 'path';
import { ipcMain, dialog, BrowserWindow } from 'electron';
import { EVENTS, DIALOGS } from '../../contents';
import { projectInfo, gamePreview } from './storage';

import ProjectTemplateCreator from './managers/ProjectTemplateCreator';
import { readdirSync, existsSync } from 'fs';

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
    /** @type {BrowserWindow} */
    this.window = window;
    this.templateCreator = new ProjectTemplateCreator(this);
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
  createProjectTemplate(event, data) {
    this.templateCreator.create(data.type, data.location)
      .then(() => {
        projectInfo.location = data.location;
      }).catch((err) => {
        let msg = `Could not create ${data.type} template at ${data.location}`;
        if (err && err.msg) {
          msg = err.msg;
        }
        dialog.showErrorBox('Failed to create template', msg);
      });
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

    switch (data.type) {
    case 'deploy':
      const deployPath = join(projectInfo.location, 'deploy');
      // Make sure the deploy folder exists because attempting to host it.
      if (!existsSync(deployPath)) {
        dialog.showErrorBox(
          'Deploy folder not found.',
          `Could not find a deploy folder in:\n${projectInfo.location}`
        );
        return;
      }
      gamePreview.previewURL = `file://${deployPath}`;
      break;

    case 'url':
      if (data.url.indexOf('http:') === -1 && data.url.indexOf('https:') === -1) {
        data.url = `http://${data.url}`;
      }
      gamePreview.previewURL = data.url;
      break;
    }

    this.window.webContents.send(EVENTS.NAVIGATE, 'preview');
  }
}

/**
 * Export the singleton instance of SpringRoll Studio.
 */
export const studio = new SpringRollStudio();