import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteStaticCopy } from "vite-plugin-static-copy";
import path from "path";
import tsconfigPaths from "vite-tsconfig-paths";
const config = {
  mode: "development",
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: true,
    minify: false,
    cssMinify: false,
    terserOptions: { compress: false, mangle: false },
  },
  define: { "process.env.NODE_ENV": "'development'" },
  esbuild: { jsx: "automatic" as const, jsxImportSource: "react" },
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        { src: "./assets/*", dest: "assets" },
        {
          src: "./public/assets/{*,}",
          dest: path.join("dist", "public/assets"),
        },
        { src: "./assets/*", dest: path.join("dist", "assets") },
      ],
      silent: true,
    }),
    tsconfigPaths(),
  ],
  css: {
    preprocessorOptions: {
      sass: {
        silenceDeprecations: [
          "abs-percent",
          "bogus-combinators",
          "call-string",
          "color-4-api",
          "color-functions",
          "color-module-compat",
          "compile-string-relative-url",
          "css-function-mixin",
          "duplicate-var-flags",
          "elseif",
          "feature-exists",
          "fs-importer-cwd",
          "function-units",
          "global-builtin",
          "import",
          "legacy-js-api",
          "mixed-decls",
          "moz-document",
          "new-global",
          "null-alpha",
          "relative-canonical",
          "slash-div",
          "strict-unary",
          "type-function",
          "user-authored",
        ],
      },
    },
  },
  resolve: {},
};
export default defineConfig(config as Record<string, unknown>);
