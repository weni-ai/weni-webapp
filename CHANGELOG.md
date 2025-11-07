# Change Log

## [2.18.0] - 2025-10-28

### Changed

- Remove appointment link and redirect to agend builder docs

## [2.17.4] - 2025-10-27

### Fixed

- Fix iframe route update by redirect in Agent Builder 2.0

## [2.17.3] - 2025-10-24

### Changed

- Remove unused championChatbotsByProject logic and related methods

### Fixed

- Fix agent builder iframe permissions

## [2.17.2] - 2025-10-16

### Added

- feat: Add 'Internal Weni' plan

### Fixed

- Fix: use company name or organization uuid to check if the user is invited

## [2.17.1] - 2025-10-06

### Changed

- Allow Agent Builder 2.0 to run via iframe instead of module federation

## [2.17.0] - 2025-10-02

### Changed

- Insights module with Module Federation for all users, removing the feature flag

### Added

- Added Agent Builder 2.0 module separating from Agent Builder 1.0

## [2.16.1] - 2025-09-18

### Fixed

- refactor: move checkProjectHasWppChannel call to a new location for improved flow
- fix: add null checks for modalCreatingProject before calling onCloseClick
- fix: permission handling for Bulk Send module in Sidebar
- fix: force bulkSend remount on sidebar option navigation

## [2.16.0] - 2025-09-18

### Added

- Added Bulk Send module

## [2.15.0] - 2025-08-28

### Added

- Added Gallery module

## [2.14.2] - 2025-08-22

### Added

- Updated privacy policy and terms of service

## [2.14.1] - 2025-08-19

### Added

- Add autoplay flag to chats iframe

## [2.14.0] - 2025-08-07

### Changed
- Refactor growthbook logic render

## [2.13.0] - 2025-07-28

### Fixed
- Fix index of profile dropdown

## [2.13.0] - 2025-07-28

### Added
- Use insights with module federation

### Fixed
- Org deletion error on success

## [2.12.13] - 2025-07-04

### Fixed
- Remove unnecessary logs

## [2.12.12] - 2025-07-03

### Fixed
- fix: use name instead of path to AB routing

## [2.12.11] - 2025-07-02

### Fixed
- Add text truncation for organization description

### Changed
- Remove 'Beta' tag from insights option

## [2.12.10] - 2025-06-27

### Fixed
- Redirect to agent-builder route when creating a project

## [2.12.9] - 2025-06-26

### Fixed
- Remove unnecessary logs
- Load Weni Web Chat only if the project needs it

## [2.12.8] - 2025-06-25

### Fixed
- Sidebar AI module UX
- Replace brain route to agent-builder

## [2.12.7] - 2025-06-25

### Fixed
- Remove UnnnicDisclaimer component and associated styles from projects.vue

## [2.12.6] - 2025-06-20

### Fixed
- Translations of commerce cards at platform 1.5 

## [2.12.5] - 2025-06-17

### Fixed
- Fix: stop fetching flow organization on project creation

## [2.12.4] - 2025-06-11

### Fixed
- Show settings page for all project types
 
## [2.12.3] - 2025-06-10
 
### Added
- CHANGELOG.md file
 