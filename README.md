_Note: Tailwind V4 is currently not supported. I'm waiting for the outcome of the following discussion to determine how to proceed. - https://github.com/tailwindlabs/tailwindcss/discussions/14764_

# Tailwind to Dart

This library transforms a [Tailwind](https://tailwindcss.com/) config into dart code that you can use in your Flutter apps. This allow you to reuse the same colors, spacing, and font sizes without having to duplicate code.

**Supported Tailwind properties**:

- Colors
- Spacing
- Font Sizes
- Line Heights
- Letter Spacing
- Border Radius
- Border Width
- Opacity

**Supported value types**

- Hex colors
- RGB colors
- RGBA colors
- numbers
- px
- em
- rem

## CLI Usage

```bash
npx tailwind-to-dart --config <path-to-tailwind-config> --output <path-to-output-file>
```

```bash
npm i -g tailwind-to-dart

tailwind-to-dart --config <path-to-tailwind-config> --output <path-to-output-file>
```

## Options

| flag          | required | type    | description                                           |
| ------------- | -------- | ------- | ----------------------------------------------------- |
| --config      | yes      | string  | path to your tailwind.config.js                       |
| --output      | yes      | string  | path to the desired output file                       |
| --format      | no       | boolean | automatically run "dart format" on the generated file |
| --remSize     | no       | string  | the desired base font-size. (Default is 16)           |
| --classPrefix | no       | string  | add a prefix to the generated classes                 |

## Typescript/Javascript Usage

All of the core functionality is exposed as Typescript functions

```ts
import fs from "node:fs";
import {
    getResolvedTailwindConfig,
    tailwindConfigToDartString,
} from "tailwind-to-dart";

async function main() {
    const config = await getResolvedTailwindConfig("./tailwind.config.js");
    if (!config.success) {
        throw new Error("Error loading config");
    }
    const dartStr = tailwindConfigToDartString(config.data, {
        // options
    });
    fs.writeFileSync("my_dart_file.dart", dartStr);
}

main();
```
