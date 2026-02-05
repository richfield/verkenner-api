import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import pluginReactRefresh from "eslint-plugin-react-refresh";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    ignores: ["dist/**"], // Exclude the dist folder and its contents
  },
  {
    files: ["**/*.{mjs,ts,mts,cts,tsx}"],
    plugins: {
      js,
      "react-refresh": pluginReactRefresh,
    }, extends: ["js/recommended"], languageOptions: { globals: globals.browser },
    rules: {
      "no-console": ["warn", { allow: ["error", "warn"] }],
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "semi": ["error", "always"],
    }
  },
  tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,

]);
