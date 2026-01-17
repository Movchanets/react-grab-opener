# Change Log

All notable changes to the "react-grab-opener" extension will be documented in this file.

## [0.1.0] - 2026-01-17

### Added
- **Multiple element selection support**: Select multiple elements in browser and open all files at once
- **Smart file path resolution**: Automatically finds component files in workspace using multiple strategies
- **First-line file detection**: Uses file path from the first line with location info
- **Duplicate file filtering**: Opens each unique file only once when multiple elements from same file
- **All files in same tab group**: Multiple files open as tabs in the same editor group
- **Permanent tabs**: Files open as permanent tabs, not preview mode
- **Component definition navigation**: Automatically scrolls to component definition using multiple patterns
- **Comprehensive HTML tag filtering**: Filters out 40+ HTML tags and React Router components
- **Support for elements without file paths**: Finds first line containing file path in stack
- **react-grab integration**: Works with react-grab npm package via `npx -y grab@latest init` command
- **Comprehensive documentation**: Added detailed setup instructions for Next.js, Vite, Webpack, and manual installation

### Changed
- Improved clipboard parsing to handle multiple `<selected_element>` blocks
- Enhanced file resolution to work with complex project structures
- Better error messages for missing files and components

### Fixed
- Files now open in same tab group instead of creating multiple editor groups
- Handles elements where first line has no file path (like `at a` or `at button`)
- Correctly identifies component files even when element is HTML tag

## [0.0.2] - Previous

### Added
- Initial implementation with basic clipboard parsing
- Alt+V keyboard shortcut
- Basic file opening functionality

## [0.0.1] - Initial

- Project setup and initial structure
