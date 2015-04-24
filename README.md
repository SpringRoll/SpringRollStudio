SpringRollStudio [![Dependency Status](https://david-dm.org/SpringRoll/SpringRollStudio.svg)](https://david-dm.org/SpringRoll/SpringRollStudio)
============

SpringRollStudio is an native application (build with [nw-init](https://github.com/CloudKidStudio/nw-init) and designed to provide graphic user interfaces for building and managing [SpringRoll](https://github.com/SpringRoll/SpringRoll) projects.

**Features**
* Manage a captions library
* Remote debugging over a network
* Run Grunt tasks for SpringRoll projects
* Scaffold a new project with support for custom templates

## Dependencies

In order to build SpringRollStudio, there are some external global dependencies that are required.

### grunt

Grunt is required to build. See the [getting started guide](http://gruntjs.com/getting-started).

```bash
npm install -g grunt-cli
```

### makensis

[makensis](http://nsis.sourceforge.net/Main_Page) is required to create the Windows setup executable. Can be installed with [brew](http://brew.sh/):

```bash
brew install makensis
```

### appdmg

[node-appdmg](https://github.com/LinusU/node-appdmg) is required to create the OS X DMG installer image.

```bash
npm install -g appdmg
```

### wine 

On OSX if building for Windows, Wine needs to be installed to create the application icon. Can be installed with [brew](http://brew.sh/)

```bash
brew install wine
```

## Building

The Grunt project is an extension of the [grunt-game-builder](https://github.com/CloudKidStudio/grunt-game-builder) and all those grunt tasks can be used on your app. In addition, there are several Grunt tasks that are specific and useful to building SpringRollStudio:

Task | Description
---|---
**app** | Builds a release version of the node-webkit app
**app-debug** | Builds a debug version of the node-webkit app
**package** | Create the OSX and Windows installers
**open** | Open the OSX application

### Examples

Build SpringRollStudio in debug mode and run:

```bash
grunt app-debug open
```

Build SpringRollStudio and package to installers:

```bash
grunt app package
```
