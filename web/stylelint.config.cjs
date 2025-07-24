module.exports = {
  extends: ["stylelint-config-standard"],
  ignoreFiles: ["dist/**/*", "build/**/*"],
  rules: {
    "at-rule-no-unknown": [
      true,
      {
        ignoreAtRules: [
          "tailwind",
          "apply",
          "variants",
          "responsive",
          "screen",
        ],
      },
    ],
    "at-rule-no-deprecated": null,
    "declaration-block-single-line-max-declarations": null,
    "selector-class-pattern": null,
    "no-duplicate-selectors": null,
    "no-descending-specificity": null,
  },
};