/** @type {import('prettier').Config} */
export default {
    printWidth: 180,
    tabWidth: 4,
    useTabs: false,
    semi: true,
    singleQuote: false,
    trailingComma: "es5",
    bracketSpacing: true,
    arrowParens: "avoid",
    sortingMethod: "alphabetical",
    plugins: ["prettier-plugin-sort-imports", "prettier-plugin-organize-imports"],
};
