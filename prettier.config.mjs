/** @type {import('prettier').Config} */
export default {
    parser: "babel",
    printWidth: 180,
    tabWidth: 4,
    useTabs: false,
    semi: true,
    singleQuote: false,
    trailingComma: "es5",
    bracketSpacing: true,
    arrowParens: "avoid",
    plugins: [
        // "prettier-plugin-sort-imports",
        // "prettier-plugin-organize-imports",
        //
        // ...tidyOptions.sortImport.prettier,
        // ...tidyOptions.organizeImports.prettier,
    ],
};
