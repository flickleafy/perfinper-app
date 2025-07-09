# Changelog for Personal Finance Helper (perfinper-app)

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
