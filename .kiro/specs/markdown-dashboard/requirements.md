# Requirements Document

## Introduction

日付ごとのディレクトリ構造で管理されているマークダウンファイルを効率的に閲覧・編集・管理するためのWebアプリケーションダッシュボードです。`/Users/tehrani/Documents/claude-outputs/` 配下の複数の日付ディレクトリを対象とし、ローカルサーバで動作するOSに依存しないWebベースのソリューションを提供します。

## Requirements

### Requirement 1

**User Story:** As a user, I want to view a dashboard of all date-based directories, so that I can quickly navigate through my organized markdown files.

#### Acceptance Criteria

1. WHEN the application starts THEN the system SHALL display a dashboard showing all date-based directories from the specified path
2. WHEN a directory is displayed THEN the system SHALL show the directory name, creation date, and file count
3. WHEN I click on a directory THEN the system SHALL navigate to show the contents of that directory
4. WHEN the dashboard loads THEN the system SHALL sort directories by date in descending order by default

### Requirement 2

**User Story:** As a user, I want to search files using tags, so that I can quickly find relevant content across all directories.

#### Acceptance Criteria

1. WHEN I enter a tag in the search field THEN the system SHALL filter and display all files containing that tag
2. WHEN multiple tags are entered THEN the system SHALL support both AND and OR search operations
3. WHEN tag search results are displayed THEN the system SHALL show the file path, preview, and relevant tags
4. WHEN no results are found THEN the system SHALL display a clear "no results" message

### Requirement 3

**User Story:** As a user, I want to mark files as favorites, so that I can quickly access frequently used documents.

#### Acceptance Criteria

1. WHEN I click a favorite button on a file THEN the system SHALL add it to my favorites list
2. WHEN I access favorites mode THEN the system SHALL display only favorited files
3. WHEN I unfavorite a file THEN the system SHALL remove it from the favorites list
4. WHEN favorites are displayed THEN the system SHALL persist favorites across browser sessions

### Requirement 4

**User Story:** As a user, I want to copy the full path of any file, so that I can easily reference or share file locations.

#### Acceptance Criteria

1. WHEN I click the copy path button THEN the system SHALL copy the full file path to the clipboard
2. WHEN the path is copied THEN the system SHALL show a confirmation message
3. WHEN the copy operation fails THEN the system SHALL display an error message
4. WHEN copying paths THEN the system SHALL use the absolute file path format

### Requirement 5

**User Story:** As a user, I want to delete files through the interface, so that I can manage my file collection efficiently.

#### Acceptance Criteria

1. WHEN I click the delete button THEN the system SHALL prompt for confirmation before deletion
2. WHEN I confirm deletion THEN the system SHALL permanently remove the file from the filesystem
3. WHEN a file is deleted THEN the system SHALL update the interface to reflect the change
4. WHEN deletion fails THEN the system SHALL display an error message and keep the file intact

### Requirement 6

**User Story:** As a user, I want to edit markdown files directly in the browser, so that I can modify content without switching applications.

#### Acceptance Criteria

1. WHEN I click edit on a markdown file THEN the system SHALL open an in-browser editor
2. WHEN I make changes in the editor THEN the system SHALL provide real-time preview of the markdown
3. WHEN I save changes THEN the system SHALL write the updated content to the original file
4. WHEN I cancel editing THEN the system SHALL discard unsaved changes and return to view mode
5. WHEN editing THEN the system SHALL support syntax highlighting for markdown

### Requirement 7

**User Story:** As a user, I want the application to run as a local web server, so that I can access it from any browser without OS dependencies.

#### Acceptance Criteria

1. WHEN the server starts THEN the system SHALL be accessible via localhost on a configurable port
2. WHEN accessed from a browser THEN the system SHALL work on Chrome, Firefox, Safari, and Edge
3. WHEN the server runs THEN the system SHALL not require any OS-specific dependencies
4. WHEN the application loads THEN the system SHALL provide a responsive interface that works on different screen sizes