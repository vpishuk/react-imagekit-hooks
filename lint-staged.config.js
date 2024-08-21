export default {
    "./eslint.config.js": ["eslint --fix"],
    "./lint-staged.config.js": ["eslint --fix"],
    "./jest.config.ts": ["eslint --fix"],
    "./lerna.json": ["eslint --fix"],
    "./src/**/*": ["eslint --fix"]
};
