# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - unreleased

### Changed

- Upgraded follow-redirects dependancy for security alert
- Bumped Node version for tests to 16.x
- Bumped electron version
- Fixed unit test errors
- Created new testing process for CaptionStudio

## [1.1.0] - 2021-08-16

### Added

- JSON Editor mode switch. Allows toggling between 'code' and 'form' modes, for better usability.

### Fixed

- Overflow: scroll causing 3-4 scroll bar regions to show up when unecessary
- Fixed styles for caption preview next/previous buttons so they properly show up side by side

## [1.0.0] - 2020-03-31

### Added

- Unit tests added for caption studio components and classes

### Changed

- Caption Studio now reads audio files directly from project root, or user specified audio directory
- Caption studio now allows for saving/opening caption JSON files directly from projects

### Added

- This CHANGELOG
- VUE front end renderer
- Electron back end
- Project Templating via Github or bundled seed projects
- Caption Studio Initial Implementation
