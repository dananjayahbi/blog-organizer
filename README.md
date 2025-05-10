# Blog Post Draft Manager Project Plan

## Introduction
The purpose of this project is to develop a desktop application for managing blog post drafts. This application will enable users to create, edit, and organize their blog post drafts efficiently using markdown formatting and image integration. Built as a standalone executable using NextJS and ElectronJS, the app aims to provide a seamless and modern user experience for bloggers managing multiple drafts.

## Requirements

### Functional Requirements
The following features and functionalities define what the application must do:
- The application shall be a standalone executable built using NextJS and ElectronJS, requiring no installation setup.
- It shall use a single `.json` file as the backend database to store all blog post drafts.
- Images shall be stored in a separate folder at the backend, with each image saved using a universally unique identifier (UUID) as its filename.
- The user interface shall feature a side navigation menu with three items: Dashboard, Posts, and Settings.
- The Posts page shall display a list of all draft posts and include a button to create a new post.
- Upon clicking the new post button, the application shall navigate to a new post designing page where users can provide post content in markdown format.
- The new post designing page shall allow users to upload a `.md` file, display a live preview of the post on the side, and enable direct editing of the `.md` file within the app.
- Users shall be able to add images to the post by uploading them, with images saved in the designated folder using UUIDs and referenced in the markdown content.
- After saving a post, the application shall redirect the user back to the Posts page.
- On the Posts page, the application shall support CRUD operations (Create, Read, Update, Delete) on each post.
- The application shall utilize Material-UI (MUI) components to achieve a modern and consistent user interface design.
- The default font throughout the application shall be Roboto.

### Non-Functional Requirements
The following qualities ensure the application's performance, usability, and reliability:
- The application shall provide a responsive and intuitive user experience, with quick loading times and smooth interactions.
- It shall handle errors gracefully, maintaining data integrity and providing clear feedback to the user (e.g., in case of file access issues).
- The application shall be cross-platform, compatible with Windows, macOS, and Linux operating systems.
- It shall maintain a modern, consistent, and user-friendly interface design throughout all pages and interactions.

## Technical Approach
The application will be developed using the following technologies and architectural considerations:
- **Frontend:** NextJS, a React framework, will be used to build the user interface, integrated with MUI components and styled with the Roboto font.
- **Backend:** ElectronJS will serve as the desktop application framework, with its main process handling file system operations.
- **Data Storage:** A single `.json` file will store an array of post objects (each with id, title, content, and timestamps), located in the app’s user data directory. Images will be stored in a separate folder within the same directory, named with UUIDs.
- **Communication:** Inter-Process Communication (IPC) will facilitate data exchange between the NextJS renderer process and the Electron main process for file operations.
- **Markdown Handling:** A markdown parsing library (e.g., `marked.js`) will render markdown content to HTML for the preview functionality.
- **Image Management:** Uploaded images will be saved with UUID filenames in the images folder and referenced in the markdown using relative paths (e.g., `images/uuid.jpg`), with proper path resolution for display.

## Development Plan
The development will proceed through the following phases:
1. **Project Setup:** Initialize the project structure with NextJS and ElectronJS integration.
2. **Backend Implementation:** Develop the Electron main process to handle `.json` file operations and image storage.
3. **UI Development:** Create the user interface using NextJS and MUI, including the side navigation and core pages (Dashboard, Posts, Settings).
4. **Posts Functionality:** Implement the posts list and CRUD operations on the Posts page.
5. **Post Editor:** Build the post designing page with markdown editing, preview, and image upload capabilities.
6. **Integration:** Connect frontend and backend via IPC for seamless data management.
7. **Testing:** Validate functionality, performance, and cross-platform compatibility.
8. **Packaging:** Build and package the application into standalone executables for Windows, macOS, and Linux using tools like `electron-builder`.

## Risks and Mitigations
- **Risk:** Inconsistent file path handling across operating systems.
  - **Mitigation:** Utilize Node.js `path` module and Electron’s `app.getPath` for platform-agnostic path management.
- **Risk:** Performance degradation with a large number of posts or images.
  - **Mitigation:** Optimize data loading and consider lazy loading or pagination if performance issues arise.
- **Risk:** Security vulnerabilities in file access.
  - **Mitigation:** Restrict file operations to the app’s data directory and validate all file paths.