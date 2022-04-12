# springroll-studio

Springroll Studio provides a convenient desktop application for creating and managing [Springroll](https://github.com/SpringRoll/SpringRoll) applications.

## Features

### Game Preview
Springroll Studio has a built in [SpringrollContainer](https://github.com/SpringRoll/SpringRollContainer) environment that can load your game directly from your projects deploy folder or from a URL(local or otherwise), allowing you to test your game within the full Springroll environment.

### Project Templating
Using the Create Project option you can download one of the [Springroll Seed Projects](https://github.com/SpringRoll/Springroll-Seed) and have a Springroll project set up and ready for development in seconds. PIXI, Phaser, and CreateJS versions are available.

### Caption Studio
Caption Studio is designed to help you in creating audio caption files (JSON format) for use in Springroll projects. Caption Studio reads your project (or selected audio directory) for any appropriate audio files and allows you to select which files you want to caption. It features:
- An interactable waveform of your audio file
- A directory structure for easy file selection and searching
- A Springroll caption renderer that will display your captions while the audio file is playing
- A JSON preview that allows you to edit your caption JSON output directly. You can either save this JSON to your project, or export it as a file to download if you so choose.

###

## Project setup
For `nvm`:
```
nvm use
```

For `asdf`:
```
asdf install nodejs
```

Then
```
npm install
```

### Compiles and hot-reloads for development
```
npm run dev
```

### Compiles and minifies for production
```
npm run electron:build
```

After running this command you will find the application install files in the `build` directory. These can be run and/or installed in the same manner as any other desktop application.

### Testing
```
npm run test
```

### Lints and fixes files
```
npm run lint
```


### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
