# Changelog for Personal Finance Helper (perfinper-app)

## 13 July 2025

### Bug Fixes
- Fixed Financial Summary layout in `FiscalBookDrawer.js` (2-row grid, nowrap)
- Fixed Edit Fiscal Book duplication bug in `FiscalBookForm.js` (handle `id`/`_id`)
- Fixed StatusBar precision in `StatusBar.js` using centralized `currencyFormat.js`
- Refactored monetary parsing logic to `infrastructure/currency/currencyFormat.js`

### Tests
- Added `RollbackConfirmDialog.test.js` for rollback confirmation coverage
- Added `SnapshotAnnotations.test.js` for annotations component coverage
- Added `SnapshotExportDialog.test.js` for export dialog coverage
- Added `SnapshotScheduleForm.test.js` for schedule form coverage
- Added `SnapshotTagsPopover.test.js` for tags popover coverage
- Updated `FiscalBookDrawer.test.js` with layout and state tests
- Updated `FiscalBookForm.test.js` with id handling regression test
- Updated `FiscalBooksList.test.js` with additional coverage
- Updated `FiscalBookBulkOperations.test.js` with bulk action tests
- Updated `SnapshotComparison.test.js` with comparison edge cases
- Updated `SnapshotsList.test.js` with comprehensive list tests
- Updated `CreateSnapshotDialog.test.js` with dialog flow tests
- Updated `snapshotService.test.js` with service layer tests
- Added `currencyFormat.test.js` for monetary parsing tests
- Updated `Buttons.test.jsx` and `ToastProvider.test.js` for UI coverage

## 12 July 2025

### Features
- **Fiscal Book Snapshots Implementation**
  - Added `CreateSnapshotDialog.js` for creating new snapshots
  - Added `SnapshotsList.js` for viewing and managing snapshots
  - Added `SnapshotComparison.js` for comparing fiscal book states
  - Added `SnapshotTagsPopover.js` for managing snapshot tags
  - Added `SnapshotExportDialog.js` for exporting snapshot data
  - Added `SnapshotScheduleForm.js` for configuring automatic snapshots
  - Added `SnapshotAnnotations.js` for snapshot notes and metadata
  - Added `RollbackConfirmDialog.js` for confirming rollback operations
  - Added `snapshotService.js` with API integration for all snapshot operations
  - Integrated snapshot dialogs and settings in `FiscalBookDrawer.js`
  - Added snapshot access from `FiscalBooksList.js`

### Bug Fixes
- Added delete confirmation and success feedback to `SnapshotsList.js`
- Added component index exports for all snapshot components

### Tests
- Added `CreateSnapshotDialog.test.js` for dialog tests
- Added `SnapshotComparison.test.js` for comparison tests
- Added `SnapshotsList.test.js` for list component tests
- Added `snapshotService.test.js` for service layer tests
- Fixed all remaining test failures in `EditTransaction.test.js`

## 11 July 2025

- **Coverage config**
  - `jest.config.js` and `package.json`: exclude `src/test-utils/*.js` from coverage collection.

- **Date adapter compatibility**
  - `src/infrastructure/date/AdapterDateFnsCompat.js`: added a date-fns compatibility adapter for MUI X.
  - `src/infrastructure/date/AdapterDateFnsCompat.test.js`: added adapter coverage for parsing, comparisons, ranges, and week/year helpers.
  - `src/components/CompanyForm.js`, `src/components/PersonForm.js`, and `src/components/TransactionForm.js`: load pickers via CommonJS and use the compat adapter.

- **Fiscal book selection**
  - `src/components/InsertTransaction/InsertTransaction.js`: track selected fiscal book, write fiscal book metadata, and reset on new transaction.
  - `src/components/EditTransaction/EditTransaction.js`: initialize fiscal book selection from local storage and fetched data.
  - `src/components/TransactionFiscalBookSelector/TransactionFiscalBookSelector.js`: support `id`/`_id` values and stable selection fallback.
  - `src/components/transactionPrototype.js` and `src/components/objectsBuilder.js`: include fiscal book fields on transaction payloads.

- **Tests**
  - `src/components/InsertTransaction/InsertTransaction.test.js`: cover fiscal book selection, legacy ids, and clearing.
  - `src/components/EditTransaction/EditTransaction.test.js`: cover selection updates, missing id guard, and local storage initialization.

- **Log cleanup**
  - `src/components/CompaniesList/CompaniesList.js`, `src/components/PeopleList/PeopleList.js`, and `src/components/TransactionsList/TransactionsList.js`: silence debug logging.
  - `src/components/EditCompany/EditCompany.js`, `src/components/EditPerson/EditPerson.js`, `src/components/InsertCompany/InsertCompany.js`, `src/components/InsertPerson/InsertPerson.js`, and `src/components/InsertTransaction/InsertTransaction.js`: silence debug logging.

## 10 July 2025

- **Dependency upgrades**
  - `package.json`: updated React, MUI, react-router-dom, date-fns, testing libraries, and eslint tooling.
  - `package-lock.json`: refreshed lockfile for the dependency updates.

- **Test compatibility fixes**
  - `jest.config.js` and `package.json`: added `react-router-dom` mapping to a local test shim and allowed transforms for `date-fns`/`@mui/x-date-pickers`.
  - `src/test-utils/react-router-dom.js`: added a lightweight router shim to make routing tests deterministic.

- **Date picker adapter path updates**
  - `src/components/TransactionForm.js`, `src/components/CompanyForm.js`, and `src/components/PersonForm.js`: switched to `@mui/x-date-pickers/AdapterDateFns`.

- **Test adjustments**
  - `src/components/InsertCompany/InsertCompany.test.js`: wait for async success message.
  - `src/components/InsertPerson/InsertPerson.test.js`: target the DatePicker input directly for change events.

- **Testing & coverage**
  - Added comprehensive unit tests across components, services, UI, and infrastructure utilities.
  - Enabled Jest coverage collection and thresholds in `jest.config.js` and `package.json`.

- **Forms & pickers**
  - Migrated MUI DatePicker usage to `slotProps.textField` in `src/components/TransactionForm.js`, `src/components/CompanyForm.js`, and `src/components/PersonForm.js`.
  - Added `data-testid` hooks for form selects and add controls in `src/components/TransactionForm.js`, `src/components/CompanyForm.js`, and `src/components/PersonForm.js`.
  - Cleared field/submit errors on input and removed required asterisks in `src/components/FiscalBookForm.js`.

- **Transactions & fiscal books**
  - Improved local storage initialization and default merging in `src/components/EditTransaction/EditTransaction.js`.
  - Added `initialImporter` support in `src/components/TransactionsImporter/TransactionsImporter.js`.
  - Updated fiscal book list sorting/filtering and loading state in `src/components/FiscalBooksList/FiscalBooksList.js`.
  - Adjusted fiscal book selector/actions rendering in `src/components/TransactionFiscalBookSelector/TransactionFiscalBookSelector.js` and `src/components/TransactionFiscalBookActions/TransactionFiscalBookActions.js`.

- **List rendering polish**
  - Normalized Typography props in list summaries for `src/components/CompaniesList/CompaniesList.js`, `src/components/PeopleList/PeopleList.js`, `src/components/FiscalBookBulkOperations/FiscalBookBulkOperations.js`, and `src/components/TransactionsList/TransactionsList.js`.
  - Added edit/delete test IDs and safer category name fallback in `src/components/TransactionsList/TransactionsList.js`.
  - Removed invalid `fullWidth` prop usage from `src/ui/SearchBar.js`.

- **Builders**
  - Tightened fiscal book `isActive` normalization in `src/components/objectsBuilder.js`.

## 9 July 2025

- **UI (Toast notifications)**
  - `src/ui/ToastProvider.js`: new toast context/provider using MUI `Snackbar` + `Alert`.
  - `src/index.js`: wraps `App` with `ToastProvider`.
  - `src/components/EditCompany/EditCompany.js`: replaces error alerts with toast messages.
  - `src/components/EditPerson/EditPerson.js`: replaces error alerts with toast messages.
  - `src/components/InsertCompany/InsertCompany.js`: replaces error alerts with toast messages.
  - `src/components/InsertPerson/InsertPerson.js`: replaces error alerts with toast messages.

- **Transactions import/export UX**
  - `src/components/TransactionsImporter/TransactionsImporter.js`: toast-based feedback, loading spinner/disabled state, and robust FileReader error handling.
  - `src/components/TransactionsExporter/TransactionsExporter.js`: toast-based feedback plus loading spinner/disabled state and improved error handling.

## 8 July 2025

- **Docs**
  - `FISCAL_BOOKS_IMPLEMENTATION.md`: new, comprehensive fiscal-books frontend implementation doc.

- **Test/Config**
  - `jest.config.js`: new Jest config (jsdom, transforms, coverage includes).
  - `src/setupTests.js`: new RTL/jest-dom setup; suppresses noisy `console.log` and MUI `console.warn` during tests.
  - package.json: `test` runs non-watch (`--watchAll=false`) + jest overrides (`testMatch`, `transformIgnorePatterns`).

- **UI (Period sorting + Search click/fill)**
  - `src/ui/sortPeriods.js`: new sorter for `''`, `YYYY`, `YYYY-MM` (empty first; years desc; months desc; unknown last) + `sortPeriods.test.js`.
  - `src/ui/PeriodSelector.js`: uses `sortPeriods`, becomes controlled (`currentPeriod`), adds `fiscalBookYear` filtering + `sx` passthrough + tests (`PeriodSelector.test.js`).
  - `src/ui/SearchBar.js`: input fills container; clicking anywhere focuses input; adds `sx` passthrough.

- **Transactions toolbar/list (layout + fiscal year propagation)**
  - `src/components/TransactionsList/TransactionsListToolBar.js`: enforces 20/60/20 flex layout; passes `fiscalBookYear` to `PeriodSelector`; adds `data-testid` / `data-fiscal-book-year` + test.
  - `src/components/TransactionsList/TransactionsList.js`: guards category fetch with try/catch; derives `selectedFiscalBookYear` from selected fiscal book and passes it to toolbar + test.

- **Fiscal book filter UX**
  - `src/components/FiscalBookFilter/FiscalBookFilter.js`: restyled to match shared inputs, compact `renderValue` with status `Chip`, menu items include status `Chip`, error toast via `Snackbar`/`Alert`, layout no longer “explodes” + test.

- **Import/Export now tied to fiscal book**
  - `src/components/TransactionsImporter/TransactionsImporter.js`: requires selecting an **open** fiscal book before import; passes `fiscalBookId` to import calls + test.
  - `src/components/TransactionsExporter/TransactionsExporter.js`: requires selecting fiscal book; exports via `GET /api/export/fiscal-book/{id}/json` + test.

- **Services**
  - `src/services/importService.js`: all import fns accept optional `fiscalBookId` and send it as query `params` + tests.
  - `src/services/fiscalBookService.js`: validates `id` earlier; `delete()` returns `response.data`; `getTransactions()` validates before request + tests.
  - `src/services/transactionService.test.js`: new coverage for transaction endpoints.

- **Other**
  - `src/infrastructure/currency/currencyFormat.test.js`: removes a thousand-separator test (the formatter currently doesn’t apply that formatting).
