# Tailwind to Dart

This library transforms a tailwind config into dart code that you can use in your flutter apps. This allow you to reuse the same colors, spacing, and font sizes without having to duplicate code.

**Currently Support Tailwind Properties**:

-   Colors
-   Spacing
-   Font Sizes

## CLI Usage

```bash
npx tailwind-to-dart --config <path-to-tailwind-config> --output <path-to-output-file>
```

## Options

| flag      | type    | description                                           |
| --------- | ------- | ----------------------------------------------------- |
| --config  | string  | path to your tailwind.config.js                       |
| --output  | string  | path to the desired output location                   |
| --format  | boolean | automatically run "dart format" on the generated file |
| --remSize | string  | the desired base font-size. (Default is 16)           |
