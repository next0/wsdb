# WebSocket DB Client

## Tech Roadmap

    [ ] solution for 1000 columns (subscribe only for visible columns)
    [ ] solution for heavy column data aka 5Mb text (truncate text on server and ask by chunks by user actions)
    [ ] add constraints and validation rules for different data types
    [ ] DBConnector move to SharedWorker
    [ ] auto caching/mocking data technique for all tests (queryClient.getQueryCache().notify and subscribe to cache change to auto create fixtures for tests)
    [ ] storybook to all components
    [ ] unit tests (vitest)
    [ ] component/integration tests (vitest + storybook)
    [ ] visual regression component tests (storybook + playwright)
    [ ] e2e tests (playwright)
    [ ] tests selectivity
    [ ] CSP + CSRF protection
    [ ] build tools tuning to optimize bundles and DX
    [ ] monorepo: npm workspaces or pnpm + turborepo
    [ ] CI/CD + deploy to CDN
    [ ] hidden sourcemaps for production env
    [ ] technical logging and monitoring / RUM (web-vitals) / errors (sentry/datadog)
    [ ] i18n and l10n
    [ ] project documentation