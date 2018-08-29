# Deprecated
With the release of SpringRoll 2.0 this repository has been deprecated.

To manage captions you can checkout the new online solution at [springroll.io](http://springroll.io)

SpringRollStudio [![Dependency Status](https://david-dm.org/SpringRoll/SpringRollStudio.svg)](https://david-dm.org/SpringRoll/SpringRollStudio)
============

SpringRollStudio is an native application (build with [NW.js](http://nwjs.io/) and designed to provide graphic user interfaces for building and managing [SpringRoll](https://github.com/SpringRoll/SpringRoll) projects.

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

### appdmg

[node-appdmg](https://github.com/LinusU/node-appdmg) is required to create the OS X DMG installer image.

```bash
npm install -g appdmg
```

### makensis

[makensis](http://nsis.sourceforge.net/Main_Page) is required to create the Windows setup executable. Can be installed with [brew](http://brew.sh/):

```bash
brew install makensis
```

### xquarts & wine

On OSX if building for Windows, Wine needs to be installed to create the application icon. First install xquartz by downloading [here](http://xquartz.macosforge.org/landing/), then Wine can be installed with [Homebrew](http://brew.sh/)

```bash
brew install wine
```

## Building

Before building, make sure to run NPM install to import Node dependencies for building the project.

```bash
npm install
```

The build tasks extend [project-grunt](https://github.com/CloudKidStudio/project-grunt) and all those Grunt tasks can be used when building SpringRoll Studio. In addition, there are several Grunt tasks that are specific and useful to building the [NW.js](http://nwjs.io/) app:

Task | Description
---|---
**app:(win32,win64,osx64,osx32)** | Builds a release version of the NW.js app, when no platform is specified, all platforms are built.
**app-debug:(win32,win64,osx64,osx32)** | Builds a debug version of the NW.js app, when no platform is specified, all platforms are build in debug mode.
**package:(win32,win64,osx64,osx32)** | Create the OSX and Windows installers, also optional platform
**open:(win32,win64,osx64,osx32)** | Open the OSX application, also optional platform

### Examples

Build SpringRollStudio in debug mode for OS X run:

```bash
grunt app-debug:osx64 open:osx64
```

Build SpringRollStudio for all platforms and package for all using:

```bash
grunt app package
```

### Known Issues

* On OS X,  building Windows 32-bit and 64-bit platforms back-to-back have been known to fail when using Wine to update the icon. The workaround is to build one platform at a time.
