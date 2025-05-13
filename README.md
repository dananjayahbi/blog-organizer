# BlogOrganizer

A modern desktop application for managing blog post drafts with a powerful Markdown editor, image management, and organizational features.

## Features

### 📝 Rich Markdown Editing
- Dual-mode editing: Choose between Markdown and Rich Text editing
- Live preview with side-by-side display
- Upload markdown files directly
- HTML snippets support for advanced formatting
- Markdown cheat sheet reference available with a single click

### 🖼️ Image Management
- Upload and embed images directly in your posts
- Insert images by URL
- Automatic cleanup of unused images when removed from posts or when posts are deleted
- Custom `images://` protocol for reliable image handling across environments

### 🏷️ Organization
- Tag your posts for easy categorization
- Archive view for browsing older content
- Sort and filter by date, title, or tags
- Auto-save functionality to prevent work loss

### 🎨 Customization
- Dark mode support for comfortable night-time writing
- Customizable snippets to save frequently used HTML blocks
- Adjustable editor settings

### 📦 Stand-alone Application
- No installation required - runs as a portable application
- Cross-platform support (Windows, macOS, Linux)
- Data stored locally - no internet connection required
- Works entirely offline for privacy and security

## Technical Details

### Built With
- **Next.js**: React framework for the user interface
- **Electron**: Desktop application framework
- **Material-UI**: Modern and responsive component library
- **Marked.js**: Markdown parsing and rendering
- **React-Quill**: Rich text editor component

### Data Storage
- Posts stored as individual JSON files in the user data directory
- Images stored in a dedicated images folder with unique filenames
- Custom HTML snippets saved separately for reuse across posts
- User settings persistent across sessions

### Architecture
- Renderer process built with Next.js for modern UI capabilities
- Main process handles file system operations and window management
- IPC (Inter-Process Communication) bridges the two processes
- Custom protocol handler for secure image referencing

## Getting Started

### Using the Application
1. Download the latest release for your platform
2. Run the executable - no installation needed
3. Create your first post by clicking "New Post" in the Posts section
4. Start writing with Markdown or Rich Text editor

### Development Setup
1. Clone this repository
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`
4. For packaging: `npm run build && npm run package` or `npm run build && npx electron-builder --win portable --config.productName="BlogOrganizer"`

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements
- Icons provided by Material-UI
- Inspired by the needs of content creators and technical writers