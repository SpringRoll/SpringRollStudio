import { app } from 'electron';
import { EVENTS } from '../../../contents';

const isMac = process.platform === 'darwin';


export const template = [
  // { role: 'appMenu' }
  ...(isMac ? [{
    label: app.name,
    submenu: [
      { role: 'about' },
      { type: 'separator' },
      { role: 'hide' },
      { role: 'hideothers' },
      { role: 'unhide' },
      { type: 'separator' },
      { role: 'quit' }
    ]
  }] : []),
  // { role: 'fileMenu' }
  {
    label: 'File',
    submenu: [
      {
        label: 'Open...',
        accelerator: isMac ? 'Cmd+O' : 'Cntrl+O',
        click: async () => {
          const { dialog, BrowserWindow } = require('electron');
          const { projectInfo, captionInfo } = require('../storage');
          const options = {
            title: 'Select SpringRoll Project',
            defaultPath: projectInfo.location,
            properties: ['openDirectory']
          };

          const paths = dialog.showOpenDialogSync(BrowserWindow.getFocusedWindow(), options);
          if (paths !== undefined) {
            projectInfo.location = paths[0];
            captionInfo.audioLocation = paths[0]; //when the project location changes also change the default audio files directory
          }
        }
      },
      {
        label: 'New Project',
        accelerator: isMac ? 'Cmd+N' : 'Cntrl+N',
        click: async () => {
          const { BrowserWindow } = require('electron');
          BrowserWindow.getFocusedWindow().webContents.send(EVENTS.OPEN_TEMPLATE_DIALOG, true);
        }
      },
      { type: 'separator' },
      {
        label: 'Choose Audio Directory',
        click: async () => {
          const { dialog, BrowserWindow } = require('electron');
          const { captionInfo } = require('../storage');
          const audio_options = {
            title: 'Select SpringRoll Project Audio Files Location',
            defaultPath: captionInfo.aduioLocation,
            properties: ['openDirectory']
          };
          const window = BrowserWindow.getFocusedWindow();
          const audio_paths = dialog.showOpenDialogSync(window, audio_options);
          if (audio_paths !== undefined) {
            captionInfo.audioLocation = audio_paths[0];
            window.webContents.send(EVENTS.UPDATE_AUDIO_LOCATION);
          }
        }
      },
      { type: 'separator' },
      isMac ? { role: 'close' } : { role: 'quit' }
    ]
  },
  // { role: 'editMenu' }
  {
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      ...(isMac ? [
        { role: 'pasteAndMatchStyle' },
        { role: 'delete' },
        { role: 'selectAll' },
        { type: 'separator' },
        {
          label: 'Speech',
          submenu: [
            { role: 'startSpeaking' },
            { role: 'stopSpeaking' }
          ]
        }
      ] : [
        { role: 'delete' },
        { type: 'separator' },
        { role: 'selectAll' }
      ])
    ]
  },
  // { role: 'viewMenu' }
  {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'forceReload' },
      { role: 'toggleDevTools' },
      { type: 'separator' },
      // { role: 'resetZoom' },
      // { role: 'zoomIn' },
      // { role: 'zoomOut' },
      {
        label: 'Preview Game',
        accelerator: isMac ? 'Alt+Cmd+P' : 'Alt+Shift+P',
      },
      {
        label: 'Caption Studio',
        accelerator: isMac ? 'Alt+Cmd+C' : 'Alt+Shift+C',
      },
      { type: 'separator' },
      { role: 'togglefullscreen' }
    ]
  },
  // { role: 'windowMenu' }
  {
    label: 'Window',
    submenu: [
      { role: 'minimize' },
      { role: 'zoom' },
      ...(isMac ? [
        { type: 'separator' },
        { role: 'front' },
        { type: 'separator' },
        { role: 'window' }
      ] : [
        { role: 'close' }
      ])
    ]
  },
  // {
  //   role: 'help',
  //   submenu: [
  //     {
  //       label: 'Learn More',
  //       click: async () => {
  //         const { shell } = require('electron');
  //         await shell.openExternal('https://electronjs.org');
  //       }
  //     }
  //   ]
  // }
];

/**
 * Menu structure used in CaptionStudio page
 */
export const captionStudioTemplate = [
  // { role: 'appMenu' }
  ...(isMac ? [{
    label: app.name,
    submenu: [
      { role: 'about' },
      { type: 'separator' },
      { role: 'services' },
      { type: 'separator' },
      { role: 'hide' },
      { role: 'hideothers' },
      { role: 'unhide' },
      { type: 'separator' },
      { role: 'quit' }
    ]
  }] : []),
  // { role: 'fileMenu' }
  {
    label: 'File',
    submenu: [
      {
        label: 'Save Captions',
        accelerator: isMac ? 'Cmd+S' : 'Cntrl+S',
        click: () => {
          const BrowserWindow = require('electron');
          BrowserWindow.webContents.getFocusedWebContents().send(EVENTS.SAVE_CAPTION_DATA);
        }
      },
      {
        label: 'Choose Audio Directory',
        click: async () => {
          const { dialog, BrowserWindow } = require('electron');
          const { captionInfo } = require('../storage');
          const audio_options = {
            title: 'Select SpringRoll Project Audio Files Location',
            defaultPath: captionInfo.aduioLocation,
            properties: ['openDirectory']
          };
          const window = BrowserWindow.getFocusedWindow();
          const audio_paths = dialog.showOpenDialogSync(window, audio_options);
          if (audio_paths !== undefined) {
            captionInfo.audioLocation = audio_paths[0];
            window.webContents.send(EVENTS.UPDATE_AUDIO_LOCATION);
          }
        }
      },
      { type: 'separator' },
      isMac ? { role: 'close' } : { role: 'quit' }

    ]
  },
  // { role: 'editMenu' }
  {
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      ...(isMac ? [
        { role: 'pasteAndMatchStyle' },
        { role: 'delete' },
        { role: 'selectAll' },
        { type: 'separator' },
        {
          label: 'Speech',
          submenu: [
            { role: 'startSpeaking' },
            { role: 'stopSpeaking' }
          ]
        }
      ] : [
        { role: 'delete' },
        { type: 'separator' },
        { role: 'selectAll' }
      ])
    ]
  },
  // { role: 'viewMenu' }
  {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'forceReload' },
      { role: 'toggleDevTools' },
      { type: 'separator' },
      { role: 'resetZoom' },
      { role: 'zoomIn' },
      { role: 'zoomOut' },
      { type: 'separator' },
      { role: 'togglefullscreen' }
    ]
  },
  // { role: 'windowMenu' }
  {
    label: 'Window',
    submenu: [
      { role: 'minimize' },
      { role: 'zoom' },
      ...(isMac ? [
        { type: 'separator' },
        { role: 'front' },
        { type: 'separator' },
        { role: 'window' }
      ] : [
        { role: 'close' }
      ])
    ]
  },
  {
    label: 'Caption Studio',
    submenu: [
      {
        label: 'Save Captions',
        accelerator: process.platform === 'darwin' ? 'Cmd+S' : 'Cntrl+S',
        click: () => {
          const BrowserWindow = require('electron');
          BrowserWindow.webContents.getFocusedWebContents().send(EVENTS.SAVE_CAPTION_DATA);
        }
      },
      {
        label: 'Clear Captions',
        click: () => {
          const BrowserWindow = require('electron');
          BrowserWindow.webContents.getFocusedWebContents().send(EVENTS.CLEAR_CAPTION_DATA);
        }
      },
      // {
      //   label: 'Export Captions',
      //   click: () => {
      //     const BrowserWindow = require('electron');
      //     BrowserWindow.webContents.getFocusedWebContents().send(EVENTS.EXPORT_CAPTION_DATA);
      //   }
      // },
    ]
  },
];

