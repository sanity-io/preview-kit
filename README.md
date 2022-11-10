# @sanity/preview-kit

[Sanity.io](https://www.sanity.io/?utm_source=github&utm_medium=readme&utm_campaign=preview-kit) toolkit for building live-as-you-type content preview experiences.
Write GROQ queries like [@sanity/client](https://github.com/sanity-io/client) and have them resolve in-memory, locally. Updates from Content Lake are streamed in real-time with sub-second latency.

Requires React 18, support for other libraries like Preact, Solid, Svelte, Vue etc is planned. For vanilla JS subscriptions you can use [@sanity/groq-store](https://github.com/sanity-io/groq-store) [directly](https://github.com/sanity-io/groq-store/blob/main/example/example.ts).

## Installation

```bash
npm i @sanity/preview-kit
```

```bash
yarn add @sanity/preview-kit
```

# Caveats

## Server-only

Explain why we're not implementing something equivalent to `useSyncExternalStore getServerSnapshot`, or `initialData`. Explain why we've decided not to support SSR hydration and go client-only with a Suspense fallback UI on startup.

## documentLimit

Explain the hard limit, how to set it correctly, and our current plans.

## token

Explain when to provide it, its implications, pros and cons and how to secure it.
