export const EVENTS = {
  NAVIGATE: 'navigate',
  OPEN_DIALOG: 'openDialog',
  OPEN_CAPTION_STUDIO: 'openCaptionStudio',
  PREVIEW_GAME: 'previewGame',
  CREATE_PROJECT_TEMPLATE: 'createProjectTemplate',
  PREVIEW_TARGET_SET: 'previewTargetSet',
  REQUEST_PREVIEW_HOST_PATH: 'requestPreviewHostPath',
  UPDATE_TEMPLATE_CREATION_LOG: 'updateTemplateCreateLog',
  PROJECT_CREATION_COMPLETE: 'projectCreationComplete',
  UPDATE_AUDIO_LOCATION: 'updateAudioLocation',
  SAVE_CAPTION_DATA: 'saveCaptionData',
  CLEAR_CAPTION_DATA: 'clearCaptionData',
  OPEN_TEMPLATE_DIALOG: 'openTemplateDialog'
};

export const DIALOGS = {
  PROJECT_LOCATION_SETTER: 'projectLocationSetter',
  AUDIO_LOCATION_SETTER: 'audioLocationSetter'
};

export const TEMPLATES = {
  github: {
    pixi: 'https://github.com/SpringRoll/Springroll-Seed/archive/templates/pixi.zip',
    phaser: 'https://github.com/SpringRoll/Springroll-Seed/archive/templates/phaser3.zip',
    createjs: 'https://github.com/SpringRoll/Springroll-Seed/archive/templates/createjs.zip'
  },
  file: {
    pixi: 'extraResources/templates/Springroll-Seed-templates-pixi.zip',
    phaser: 'extraResources/templates/Springroll-Seed-templates-phaser3.zip',
    createjs: 'extraResources/templates/Springroll-Seed-templates-createjs.zip'
  }
};