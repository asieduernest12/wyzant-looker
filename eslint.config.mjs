import pluginJs from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import eslintPluginImport from "eslint-plugin-import";
import eslintPluginOrganizeImports from "eslint-plugin-organize-imports";
import pathAlias from "eslint-plugin-path-alias";
import globals from "globals";

/** @type {import('eslint').Linter.Config[]} */
export default [
    { languageOptions: { globals: globals.browser } },
    pluginJs.configs.recommended,
    eslintConfigPrettier,
    {
        plugins: {
            "path-alias": pathAlias,
            "organize-imports": eslintPluginOrganizeImports,
            import: eslintPluginImport,
        },
        rules: {
            "sort-imports": "error",
            "import/first": "error",
            "import/newline-after-import": "error",
            "import/no-duplicates": "error",
            "import/no-relative-packages": "error",
            "no-unused-vars": ["error", { args: "none" }],
            "path-alias/no-relative": "error",
            "no-undef": ["error", { typeof: true }],
        },
        files: ["**src/*"],
    },
];
