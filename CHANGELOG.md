# Change Log

## [2.24.0] - 2026-01-08

### Changed
- feat: sidebar refactor with marketing project role


## [2.23.3] - 2025-12-18

### Changed
- feat: add support to redirect to insights human suport dashboard

## [2.23.2] - 2025-12-09

### Changed
- feat: add excludeWppDemo parameter to listChannels API

## [2.23.1] - 2025-12-02

### Fixed

- fix: add 'bulkSend' to disabled routes to disable force remount

### Changed

- feat: update Spanish and Portuguese localization for AI_BUILD label
- style: adjust gap spacing in ProjectPreferences form

## [2.23.0] - 2025-12-01

### Added

- Feat: new project language settings

## [2.22.0] - 2025-11-24

### Changed

- Update sidebar icons and labels
- Disable force remount on AI routes
- Update @weni/unnnic-system version to 3.11.0

## [2.21.1] - 2025-11-17

### Fixed

- Fixed the height of the settings sidebar, which could previously hide some items.

## [2.21.0] - 2025-11-13

### Added

- Add new modules as an option for redirection
- Split agent builder modules

### Removed

- Remove SystemCommerce component and related routes

### Changed

- Replace SystemGallery with SystemAutomations

### Fixed

- Correct typo in isSaveButtonDisabled method in updateOrg.vue

## [2.20.0] - 2025-11-10

### Added

- Add router synchronization for Module Federation in SystemInsights and SystemBulkSend components
- Add comprehensive test suite for SystemBulkSend component (11 tests)
- Add module federation mocks (bulk_send/main, agent_builder/main) to vite.config.js

### Fixed

- **Critical**: Fix Module Federation module insights continuing to make API calls when navigating to other routes
- Fix memory leak by properly unmounting federated modules when not in use
- Fix URL query params not persisting when using filters in Module Federation modules (insights, bulkSend)
- Fix route synchronization between federated modules and host application
- Fix duplicate path issue in updateRoute event dispatcher

### Changed

- Implement hybrid lifecycle management for federated modules (pause immediately, unmount after 5min of inactivity)
- Add `activeFederatedModules` state to SharedStore for parent-child communication
- Modules now maintain state when switching routes quickly but unmount to free memory after 5 minutes
- Update SystemInsights tests to cover new router synchronization features
- Improve useModuleUpdateRoute composable to properly handle query parameters

## [2.19.0] - 2025-11-07

### Removed

- Remove unused Plataform1.5

### Changed

- Insights as home page

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
 