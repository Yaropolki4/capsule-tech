// `@langchain/langgraph`'s package.json "exports" map confuses TypeScript's
// classic ("node10") module resolution for the "/prebuilt" subpath — see the
// tsc error this used to produce. The real runtime `require()` (Node itself,
// webpack, esbuild) resolves this subpath correctly via `exports`; only tsc's
// own resolver can't see it. Re-declaring it here as an ambient module (typed
// via the real .d.ts file, resolved through a deep path that bypasses the
// "exports" map at the type level only) fixes the type-check without touching
// runtime resolution — so it can't leak into tools like ts-node that apply
// tsconfig `paths` at require-time too.
declare module '@langchain/langgraph/prebuilt' {
  export * from '@langchain/langgraph/dist/prebuilt/index';
}
