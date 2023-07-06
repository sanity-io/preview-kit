<!-- markdownlint-disable --><!-- textlint-disable -->

# 📓 Changelog

All notable changes to this project will be documented in this file. See
[Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [2.3.1](https://github.com/sanity-io/preview-kit/compare/v2.3.0...v2.3.1) (2023-07-06)

### Bug Fixes

- **docs:** stage changes to README for click to edit ([#408](https://github.com/sanity-io/preview-kit/issues/408)) ([6316e22](https://github.com/sanity-io/preview-kit/commit/6316e22b31b6c6f6812098539113314211eadd49))

## [2.3.0](https://github.com/sanity-io/preview-kit/compare/v2.2.4...v2.3.0) (2023-06-29)

### Features

- use `perspective` features ([#389](https://github.com/sanity-io/preview-kit/issues/389)) ([4139e28](https://github.com/sanity-io/preview-kit/commit/4139e286834c385e4de60d46784a6e30cd3b5549))

### Bug Fixes

- allow `encodeSourceMap` to be a string ([79d681e](https://github.com/sanity-io/preview-kit/commit/79d681e9524969f656f1a40321919a04c88e45d4))
- **deps:** update `@sanity/client` to v6.1.3 ([b149be6](https://github.com/sanity-io/preview-kit/commit/b149be6cc9fad319516edc4c8ca61a7afee850a0))
- improve logger message ([3facebf](https://github.com/sanity-io/preview-kit/commit/3facebf657431e03277787694561a92e550bcdaa))
- make `studioUrl` optional ([3ffa49f](https://github.com/sanity-io/preview-kit/commit/3ffa49f23564b652788ef3f1070f40d16ab8d6f1))
- only forward valid `client` options ([e9b0494](https://github.com/sanity-io/preview-kit/commit/e9b049436d3e415a9a537dab58e98a04bd899978))
- set `sanity.preview-kit.turbo` tag by default for CSM live preview ([0fac392](https://github.com/sanity-io/preview-kit/commit/0fac3927c81183d06ab48758c53098daf21a34ac))
- set `sanity.preview-kit` tag by default ([c1c91e0](https://github.com/sanity-io/preview-kit/commit/c1c91e0a43e6e82c47766eeaf78bb90db5b1d268))
- support `cache.listen = false` ([57de7cc](https://github.com/sanity-io/preview-kit/commit/57de7cc4e6a61abf774de9f5a6df87de9013ff8d))

## [2.2.4](https://github.com/sanity-io/preview-kit/compare/v2.2.3...v2.2.4) (2023-06-28)

### Bug Fixes

- **deps:** update non-major ([#401](https://github.com/sanity-io/preview-kit/issues/401)) ([a78891c](https://github.com/sanity-io/preview-kit/commit/a78891cc8535f4d4addabd9ed17d3c989daa9b27))

## [2.2.3](https://github.com/sanity-io/preview-kit/compare/v2.2.2...v2.2.3) (2023-06-27)

### Bug Fixes

- **deps:** update non-major ([#397](https://github.com/sanity-io/preview-kit/issues/397)) ([a0112cf](https://github.com/sanity-io/preview-kit/commit/a0112cfcee6565f545d7da7110a9df0ffaa086ee))

## [2.2.2](https://github.com/sanity-io/preview-kit/compare/v2.2.1...v2.2.2) (2023-06-21)

### Bug Fixes

- make sure cancelled requests don't throw ([27143f1](https://github.com/sanity-io/preview-kit/commit/27143f1987cba1bc6219a7e8f7a0d0dd29e1b0ef))

## [2.2.1](https://github.com/sanity-io/preview-kit/compare/v2.2.0...v2.2.1) (2023-06-21)

### Bug Fixes

- apply `includeTypes` to `count` query ([3eefa35](https://github.com/sanity-io/preview-kit/commit/3eefa35080ee2e2772ab8043223c6ae5fb1fb717))

## [2.2.0](https://github.com/sanity-io/preview-kit/compare/v2.1.1...v2.2.0) (2023-06-20)

### Features

- add `LiveQueryProvider` & `useLiveQuery` ([1e460b3](https://github.com/sanity-io/preview-kit/commit/1e460b397243e3792f123185be0f442dbaa7f43d))

### Bug Fixes

- **deps:** update dependency lru-cache to v10 ([#383](https://github.com/sanity-io/preview-kit/issues/383)) ([2cb326c](https://github.com/sanity-io/preview-kit/commit/2cb326c10b2997631e544cbe4f3bb353e7b94a81))

## [2.1.1](https://github.com/sanity-io/preview-kit/compare/v2.1.0...v2.1.1) (2023-06-10)

### Bug Fixes

- throw error if `initialSnapshot` is undefined ([1ed2bf6](https://github.com/sanity-io/preview-kit/commit/1ed2bf68b54cbebbe9ea69363d96b8ae1381b17c))

## [2.1.0](https://github.com/sanity-io/preview-kit/compare/v2.0.0...v2.1.0) (2023-06-09)

### Features

- add `useListeningQueryStatus` hook ([#378](https://github.com/sanity-io/preview-kit/issues/378)) ([1f3da96](https://github.com/sanity-io/preview-kit/commit/1f3da96c188301893cedba3bf4e0d959a6c2762b))

### Bug Fixes

- remove unused `groq` dependency ([5159973](https://github.com/sanity-io/preview-kit/commit/51599738cddbe1cf01a51e2a45fadd7ac41a7a63))

## [2.0.0](https://github.com/sanity-io/preview-kit/compare/v1.5.4...v2.0.0) (2023-06-09)

### ⚠ BREAKING CHANGES

- `definePreview` and `<PreviewSuspense>` are replaced by `<GroqStoreProvider>`.
- `usePreview` is replaced by `useListeningQuery`.
- `@sanity/client` is now a peer dependency.

[The migration guide outlines every breaking change and how to migrate your code](https://github.com/sanity-io/preview-kit/blob/main/MIGRATION.md)

### Features

- Live previews are now easier to build, have a much shorter bootup time and you no longer need separate preview versions of components as `useListeningQuery` can be disabled for production modes.
- `token` are set in a single location, `<GroqStoreProvider>`, instead of prop-drilled to every preview component.
- `Suspense` boundaries now optional, you only need them if you're code-splitting `GroqStoreProvider` with `React.lazy`

### Bug Fixes

- Preview hooks no longer perform queries while the initial dataset export is streaming, as this could lead to incomplete query results and unexpected cases of `null`.

## [1.5.2](https://github.com/sanity-io/preview-kit/compare/v1.5.1...v1.5.2) (2023-05-03)

### Bug Fixes

- make `encodeSourceMap` optional ([d03717b](https://github.com/sanity-io/preview-kit/commit/d03717b7c651bb94017ce86412a18b28de4f4d50))

## [1.5.1](https://github.com/sanity-io/preview-kit/compare/v1.5.0...v1.5.1) (2023-05-03)

### Bug Fixes

- add release notes ([8a401e0](https://github.com/sanity-io/preview-kit/commit/8a401e0ecc865d52305b15dcae8ac881f6567b96))

## [1.5.0](https://github.com/sanity-io/preview-kit/compare/v1.4.1...v1.5.0) (2023-05-03)

### Introducing Content Source Maps

> **Note**
>
> Content Source Maps are available for select [Sanity enterprise customers](https://www.sanity.io/enterprise?utm_source=github.com&utm_medium=referral&utm_campaign=may-vercel-launch). [Contact our sales team for more information.](https://www.sanity.io/contact/sales?utm_source=github.com&utm_medium=referral&utm_campaign=may-vercel-launch)

![](https://i.imgur.com/wt95U5Q.jpg)

Content Source Maps are an optional layer of contextual metadata sent with queries to enable use cases such as [Visual Editing](https://www.sanity.io/blog/visual-editing-sanity-vercel?utm_source=github.com&utm_medium=referral&utm_campaign=may-vercel-launch), tracing content lineage, and more. Our implementation of Content Source Maps are based on an [open standard posted on GitHub](https://github.com/sanity-io/content-source-maps), and you can read [the API documentation here](https://#https://www.sanity.io/docs/content-source-maps?utm_source=github.com&utm_medium=referral&utm_campaign=may-vercel-launch).

## [1.4.1](https://github.com/sanity-io/preview-kit/compare/v1.4.0...v1.4.1) (2023-05-03)

### Bug Fixes

- **docs:** add README.md to published package ([fdf29af](https://github.com/sanity-io/preview-kit/commit/fdf29afb58c26b637539b90538c90d8757885087))

## [1.4.0](https://github.com/sanity-io/preview-kit/compare/v1.3.8...v1.4.0) (2023-04-11)

### Features

- expose listen config for non-live previews ([#298](https://github.com/sanity-io/preview-kit/issues/298)) ([e5a1d56](https://github.com/sanity-io/preview-kit/commit/e5a1d56c7e04f86c4eb6e90b635bf909decfc9cc))

## [1.3.8](https://github.com/sanity-io/preview-kit/compare/v1.3.7...v1.3.8) (2023-03-24)

### Bug Fixes

- **deps:** update dependency @sanity/groq-store to v2.1.0 ([#283](https://github.com/sanity-io/preview-kit/issues/283)) ([e94fce2](https://github.com/sanity-io/preview-kit/commit/e94fce20305ded323b740eda9a02f37bcc4c2a84))
- replace `event-source-polyfill` with `@sanity/eventsource` ([#286](https://github.com/sanity-io/preview-kit/issues/286)) ([11eac9e](https://github.com/sanity-io/preview-kit/commit/11eac9ea591cc321f317c46faa6732e185e1c2a7))

## [1.3.7](https://github.com/sanity-io/preview-kit/compare/v1.3.6...v1.3.7) (2023-03-22)

### Bug Fixes

- **deps:** update dependency @sanity/groq-store to v2.0.9 ([#280](https://github.com/sanity-io/preview-kit/issues/280)) ([95cb42a](https://github.com/sanity-io/preview-kit/commit/95cb42a6dfbe9a2e9261dcca9434f38a8f9e9312))

## [1.3.6](https://github.com/sanity-io/preview-kit/compare/v1.3.5...v1.3.6) (2023-03-08)

### Bug Fixes

- **deps:** update dependency @sanity/groq-store to ^2.0.8 ([#262](https://github.com/sanity-io/preview-kit/issues/262)) ([900c9fe](https://github.com/sanity-io/preview-kit/commit/900c9fef6d4e13b0eb379aa38ff09885fef8139e))

## [1.3.5](https://github.com/sanity-io/preview-kit/compare/v1.3.4...v1.3.5) (2023-03-06)

### Bug Fixes

- **deps:** update dependency @sanity/pkg-utils to ^2.2.8 ([#256](https://github.com/sanity-io/preview-kit/issues/256)) ([7f730a1](https://github.com/sanity-io/preview-kit/commit/7f730a192accdf08f2ab23c753ec27f1aa54149a))

## [1.3.4](https://github.com/sanity-io/preview-kit/compare/v1.3.3...v1.3.4) (2023-02-14)

### Bug Fixes

- bump `@sanity/groq-store` to `2.0.7` ([cad23ec](https://github.com/sanity-io/preview-kit/commit/cad23ec00aa450923e84f06130f6103cecc52003))

## [1.3.3](https://github.com/sanity-io/preview-kit/compare/v1.3.2...v1.3.3) (2023-02-02)

### Bug Fixes

- **deps:** update dependency @sanity/groq-store to ^2.0.6 ([#222](https://github.com/sanity-io/preview-kit/issues/222)) ([434f850](https://github.com/sanity-io/preview-kit/commit/434f8506e4810bdc6cf2ee43e71d471add73ca62))
- **deps:** update dependency @types/event-source-polyfill to ^1.0.1 ([#214](https://github.com/sanity-io/preview-kit/issues/214)) ([50d1cce](https://github.com/sanity-io/preview-kit/commit/50d1ccef56e06c0be6fd82701c1be9cfbe701e95))

## [1.3.2](https://github.com/sanity-io/preview-kit/compare/v1.3.1...v1.3.2) (2023-01-23)

### Bug Fixes

- **deps:** update dependency @sanity/groq-store to ^2.0.5 ([#209](https://github.com/sanity-io/preview-kit/issues/209)) ([d4cc3bc](https://github.com/sanity-io/preview-kit/commit/d4cc3bc55a216d35d182424b2864eaa884908713))

## [1.3.1](https://github.com/sanity-io/preview-kit/compare/v1.3.0...v1.3.1) (2023-01-19)

### Bug Fixes

- prevent SSR hydration errors ([f67a8ff](https://github.com/sanity-io/preview-kit/commit/f67a8ff914273940b801e0d692bd9025fe3a685a))

## [1.3.0](https://github.com/sanity-io/preview-kit/compare/v1.2.24...v1.3.0) (2023-01-19)

### Features

- add optional `serverSnapshot` to `usePreview` ([#199](https://github.com/sanity-io/preview-kit/issues/199)) ([1dc68f8](https://github.com/sanity-io/preview-kit/commit/1dc68f8d58853a664bc33751c118fc6d0882d84b))

## [1.2.24](https://github.com/sanity-io/preview-kit/compare/v1.2.23...v1.2.24) (2023-01-18)

### Bug Fixes

- export \_preloadQuery for easier customization ([f3f5743](https://github.com/sanity-io/preview-kit/commit/f3f574352faa7d2eedf0379c0321ad3eced75cf2)), closes [#63](https://github.com/sanity-io/preview-kit/issues/63)
- make `overlayDrafts` configurable ([87de43d](https://github.com/sanity-io/preview-kit/commit/87de43d2be2dd05650bb60db14b0c6ccfc8a811b))

## [1.2.23](https://github.com/sanity-io/preview-kit/compare/v1.2.22...v1.2.23) (2023-01-14)

### Bug Fixes

- **deps:** update dependency @sanity/groq-store to ^2.0.3 ([#175](https://github.com/sanity-io/preview-kit/issues/175)) ([58ba8f3](https://github.com/sanity-io/preview-kit/commit/58ba8f3056354e9b5bed4fa7647865cca8ab5047))
- **deps:** update dependency @sanity/groq-store to ^2.0.4 ([#184](https://github.com/sanity-io/preview-kit/issues/184)) ([a867ade](https://github.com/sanity-io/preview-kit/commit/a867adead8e531528a2b5a8e0a9d63de12483706))
- **deps:** update devdependencies (non-major) to ^3.2.3 ([#177](https://github.com/sanity-io/preview-kit/issues/177)) ([002524e](https://github.com/sanity-io/preview-kit/commit/002524ebfe601f141739d51c4ddd74a345b7b301))

## [1.2.22](https://github.com/sanity-io/preview-kit/compare/v1.2.21...v1.2.22) (2023-01-12)

### Bug Fixes

- **deps:** update dependency @sanity/groq-store to ^2.0.2 ([#164](https://github.com/sanity-io/preview-kit/issues/164)) ([bee2092](https://github.com/sanity-io/preview-kit/commit/bee2092f6b854898c2a18e0b9f0832ff629ee4ad))

## [1.2.21](https://github.com/sanity-io/preview-kit/compare/v1.2.20...v1.2.21) (2023-01-12)

### Bug Fixes

- **deps:** update dependency @sanity/groq-store to v2 ([#160](https://github.com/sanity-io/preview-kit/issues/160)) ([aab6ca4](https://github.com/sanity-io/preview-kit/commit/aab6ca44775ec40f43a2969f2eadd9936cfae546))

## [1.2.20](https://github.com/sanity-io/preview-kit/compare/v1.2.19...v1.2.20) (2023-01-12)

### Bug Fixes

- **deps:** update dependency @sanity/groq-store to ^1.1.5 ([#157](https://github.com/sanity-io/preview-kit/issues/157)) ([2c93b47](https://github.com/sanity-io/preview-kit/commit/2c93b47b01521feb52291013c44147b508778c62))

## [1.2.19](https://github.com/sanity-io/preview-kit/compare/v1.2.18...v1.2.19) (2023-01-08)

### Bug Fixes

- improve ESM support ([e4efc52](https://github.com/sanity-io/preview-kit/commit/e4efc52c4a2c38fc3f1ed977f0afd3b2b0f1ba4c))

## [1.2.18](https://github.com/sanity-io/preview-kit/compare/v1.2.17...v1.2.18) (2023-01-07)

### Bug Fixes

- **build:** auto-generate Node ESM wrapper ([#128](https://github.com/sanity-io/preview-kit/issues/128)) ([98a8ece](https://github.com/sanity-io/preview-kit/commit/98a8eced1613300fd629d50a6c37ab8bb681a888))
- **deps:** update dependency @sanity/pkg-utils to ^2.1.1 ([#135](https://github.com/sanity-io/preview-kit/issues/135)) ([4a06b58](https://github.com/sanity-io/preview-kit/commit/4a06b585c0bfdb104cb9484a9ed6f60955bb5261))

## [1.2.17](https://github.com/sanity-io/preview-kit/compare/v1.2.16...v1.2.17) (2023-01-02)

### Bug Fixes

- **build:** include `node` directory ([#127](https://github.com/sanity-io/preview-kit/issues/127)) ([b9268b0](https://github.com/sanity-io/preview-kit/commit/b9268b0ba3312d3575f531f57554fa542b891bb7))

## [1.2.16](https://github.com/sanity-io/preview-kit/compare/v1.2.15...v1.2.16) (2023-01-02)

### Bug Fixes

- improve Node.js ESM runtime support ([5392720](https://github.com/sanity-io/preview-kit/commit/53927208ce6025ab2a1378166822d20c0b1bf500))

## [1.2.15](https://github.com/sanity-io/preview-kit/compare/v1.2.14...v1.2.15) (2022-12-30)

### Bug Fixes

- **deps:** update devdependencies (non-major) ([#120](https://github.com/sanity-io/preview-kit/issues/120)) ([ab892a0](https://github.com/sanity-io/preview-kit/commit/ab892a0b43f4ed8667b1e4f38e9256c040518465))

## [1.2.14](https://github.com/sanity-io/preview-kit/compare/v1.2.13...v1.2.14) (2022-12-23)

### Bug Fixes

- **deps:** lock file maintenance ([#112](https://github.com/sanity-io/preview-kit/issues/112)) ([09101a3](https://github.com/sanity-io/preview-kit/commit/09101a3d1ceb1dd3abc153586ba23084cc653654))

## [1.2.13](https://github.com/sanity-io/preview-kit/compare/v1.2.12...v1.2.13) (2022-12-23)

### Bug Fixes

- **deps:** update dependency @sanity/pkg-utils to ^2.0.1 ([#110](https://github.com/sanity-io/preview-kit/issues/110)) ([be2ac8a](https://github.com/sanity-io/preview-kit/commit/be2ac8ae585e5b5e1c29dbc75320a4e7f0fc5654))

## [1.2.12](https://github.com/sanity-io/preview-kit/compare/v1.2.11...v1.2.12) (2022-12-23)

### Bug Fixes

- **deps:** update dependency @sanity/pkg-utils to v2 ([#107](https://github.com/sanity-io/preview-kit/issues/107)) ([8cbf92c](https://github.com/sanity-io/preview-kit/commit/8cbf92c7c6d005ac2c87c74872da874482028f85))

## [1.2.11](https://github.com/sanity-io/preview-kit/compare/v1.2.10...v1.2.11) (2022-12-18)

### Bug Fixes

- **deps:** update dependency suspend-react to ^0.0.9 ([#95](https://github.com/sanity-io/preview-kit/issues/95)) ([e08db7c](https://github.com/sanity-io/preview-kit/commit/e08db7c832c2c0fbc075aa4058f2f8881ddc0751))

## [1.2.10](https://github.com/sanity-io/preview-kit/compare/v1.2.9...v1.2.10) (2022-12-06)

### Bug Fixes

- **deps:** update dependency @sanity/pkg-utils to ^1.20.1 ([#52](https://github.com/sanity-io/preview-kit/issues/52)) ([40f29d7](https://github.com/sanity-io/preview-kit/commit/40f29d7c0a558e390ba14e0028634ed09aa8c64e))

## [1.2.9](https://github.com/sanity-io/preview-kit/compare/v1.2.8...v1.2.9) (2022-11-25)

### Bug Fixes

- call `store.close` on `beforeunload` ([3ba6ec3](https://github.com/sanity-io/preview-kit/commit/3ba6ec3aa0aaedd62b81e4ab76a925e1a903379d))

## [1.2.8](https://github.com/sanity-io/preview-kit/compare/v1.2.7...v1.2.8) (2022-11-18)

### Bug Fixes

- support `swcMinify` in NextJS 13 ([#29](https://github.com/sanity-io/preview-kit/issues/29)) ([0c3ecec](https://github.com/sanity-io/preview-kit/commit/0c3ecec4f300c239cc3814ab5364bbb68194964e))

## [1.2.7](https://github.com/sanity-io/preview-kit/compare/v1.2.6...v1.2.7) (2022-11-16)

### Bug Fixes

- set `subscriptionThrottleMs` to `10` by default ([43f60ad](https://github.com/sanity-io/preview-kit/commit/43f60ad1c4fbe254a320c90c92ae165ef926f5f8))

## [1.2.6](https://github.com/sanity-io/preview-kit/compare/v1.2.5...v1.2.6) (2022-11-16)

### Bug Fixes

- add `documentLimit` to the `PreviewConfig` public type ([7fe1e9c](https://github.com/sanity-io/preview-kit/commit/7fe1e9c2799e53300476e264c5f57c185403bad6))

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
