import { defineConfig } from 'tsup'

export default defineConfig({
  entryPoints: ['src/server.ts'],
  outDir: 'build',
  format: ['cjs', 'esm'],
  dts: true,
  minify: true,
  clean: true,
  sourcemap: true,
  legacyOutput: true
})
