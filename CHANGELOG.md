<!-- markdownlint-disable --><!-- textlint-disable -->

# 📓 Changelog

All notable changes to this project will be documented in this file. See
[Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [1.2.5](https://github.com/sanity-io/preview-kit/compare/v1.2.4...v1.2.5) (2022-11-16)

### Bug Fixes

- **deps:** update dependency @sanity/groq-store to ^1.1.2 ([#20](https://github.com/sanity-io/preview-kit/issues/20)) ([7c95b10](https://github.com/sanity-io/preview-kit/commit/7c95b105c678b931136137b526536d35cf744ceb))
- set `documentLimit` to 3000, like `next-sanity` ([b4dcbe2](https://github.com/sanity-io/preview-kit/commit/b4dcbe2264afb29a35562529f0de4ff7f6ff2f01))

## [1.2.4](https://github.com/sanity-io/preview-kit/compare/v1.2.3...v1.2.4) (2022-11-16)

### Bug Fixes

- **README:** add create-react-app examples ([3b6d705](https://github.com/sanity-io/preview-kit/commit/3b6d7057bbaae946407578cdbfc339a4c7721971))
- **README:** add remix example ([9e3a262](https://github.com/sanity-io/preview-kit/commit/9e3a2628d0110e349c0c67f289ddf2b64d9f586d))

## [1.2.3](https://github.com/sanity-io/preview-kit/compare/v1.2.2...v1.2.3) (2022-11-15)

### Bug Fixes

- **deps:** update dependency @sanity/groq-store to ^1.1.1 ([#15](https://github.com/sanity-io/preview-kit/issues/15)) ([bae9f2f](https://github.com/sanity-io/preview-kit/commit/bae9f2f78fa312767f2b77bf89613bfef4d8aaa8))

## [1.2.2](https://github.com/sanity-io/preview-kit/compare/v1.2.1...v1.2.2) (2022-11-15)

### Bug Fixes

- issue preventing remix from lazy loading `event-source-polyfill` ([e44483f](https://github.com/sanity-io/preview-kit/commit/e44483fa967bc7e572cf0c3897ebf444366d3290))
- validate `usePreview` is only called clientside ([0aeaa76](https://github.com/sanity-io/preview-kit/commit/0aeaa76ddcaa5798fd1d6eca3062127828acadf0))

## [1.2.1](https://github.com/sanity-io/preview-kit/compare/v1.2.0...v1.2.1) (2022-11-15)

### Bug Fixes

- add 'use client' directive ([00d3758](https://github.com/sanity-io/preview-kit/commit/00d375886c9acdec86b1fa0a19d484731a3b368c))
- no longer require `useMemo` on `params` ([f8fdf5b](https://github.com/sanity-io/preview-kit/commit/f8fdf5ba48e368fc178ba4c0fe0fd7005284134f))

## [1.2.0](https://github.com/sanity-io/preview-kit/compare/v1.1.3...v1.2.0) (2022-11-15)

### Features

- add support for fetching subset of dataset by type ([#9](https://github.com/sanity-io/preview-kit/issues/9)) ([fcb084d](https://github.com/sanity-io/preview-kit/commit/fcb084de983fba308683a6488a186cc2e275320e))

## [1.2.0-add-type-allowlist.1](https://github.com/sanity-io/preview-kit/compare/v1.1.3...v1.2.0-add-type-allowlist.1) (2022-11-14)

### Features

- add support for fetching subset of dataset by type ([768a6da](https://github.com/sanity-io/preview-kit/commit/768a6dab73a8cfd2e5e8f23b4f7bbeac09cc16b3))

## [1.1.3](https://github.com/sanity-io/preview-kit/compare/v1.1.2...v1.1.3) (2022-11-11)

### Bug Fixes

- infinite render loop when providing `params` ([232cf61](https://github.com/sanity-io/preview-kit/commit/232cf61a4cc185f3861d1640e9666beec35f8ee4))

## [1.1.2](https://github.com/sanity-io/preview-kit/compare/v1.1.1...v1.1.2) (2022-11-11)

### Bug Fixes

- publish package with public scope ([e4da8f6](https://github.com/sanity-io/preview-kit/commit/e4da8f6986db737325f5081abc1f3abede80e28d))

## [1.1.1](https://github.com/sanity-io/preview-kit/compare/v1.1.0...v1.1.1) (2022-11-11)

### Bug Fixes

- publish `checkAuth` fixes ([5e6d270](https://github.com/sanity-io/preview-kit/commit/5e6d270ed8faf41d77551c66815d151de59c37c1))

## [1.1.0](https://github.com/sanity-io/preview-kit/compare/v1.0.0...v1.1.0) (2022-11-11)

### Features

- add `onPublicAccessOnly` event ([242f5b2](https://github.com/sanity-io/preview-kit/commit/242f5b2cb51401472c388752ed18876d6b10bc0a))

## 1.0.0 (2022-11-11)

### Features

- add `definePreview` API ([a505793](https://github.com/sanity-io/preview-kit/commit/a505793d336e7bf801f783c46a74cbed35e071f9))
- add `PreviewSuspense` ([2072640](https://github.com/sanity-io/preview-kit/commit/2072640d60817cc36f00f81e7617f1d14eb1eac1))
- add lazy loading utils ([b361111](https://github.com/sanity-io/preview-kit/commit/b3611116f761e60f903fa910bc45c407542a93b5))
