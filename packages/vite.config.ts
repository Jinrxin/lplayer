import { resolve } from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import vue from "@vitejs/plugin-vue";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";

export default defineConfig({
  plugins: [
    vue(),
    dts({
      entryRoot: "../packages",
      outDir: [
        resolve(__dirname, "./dist/es"),
        resolve(__dirname, "./dist/lib"),
      ],
      tsconfigPath: "../tsconfig.json",
    }),
    cssInjectedByJsPlugin(),
  ],
  build: {
    target: "modules",
    lib: {
      entry: "index.ts",
      name: "lplayer",
    },
    rollupOptions: {
      // 排除不需要打包的内容
      external: ["vue"],
      // 打包输入的入口文件
      input: ["index.ts"],
      // 打包输出为cjs(CommonJS)和esm(ESModule)两种形式
      output: [
        {
          format: "es",
          entryFileNames: "[name].js",
          dir: resolve(__dirname, "./dist/es"),
          preserveModules: true,
        },
        {
          format: "cjs",
          entryFileNames: "[name].js",
          dir: resolve(__dirname, "./dist/lib"),
          preserveModules: true,
        },
      ],
    },
  },
});
