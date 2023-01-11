import { defineConfig } from 'tsup';

export default defineConfig({
    clean: true,
    bundle: false,
    dts: true,
    format: ['cjs', 'esm'],
    keepNames: true,
    minify: false,
    entry: ['./src'],
    skipNodeModulesBundle: true,
    sourcemap: true,
    target: 'ES2020',
    silent: true
});
