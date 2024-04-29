import { camelCase, pascalCase } from "scule";
import resolveTwConfig from "tailwindcss/resolveConfig.js";
import path from "pathe";
import { loadConfig } from "c12";
import { consola } from "consola";

interface CodegenContext {
    instancePath: string;
    classPrefix: string;
    remValue: number;
}

interface CodegenOptions {
    /**
     * default is 16
     */
    remValue?: number;
    classPrefix?: string;
}

export type TailwindConfigResult =
    | { success: false; data: null }
    | { success: true; data: ReturnType<typeof resolveTwConfig> };

export async function getResolvedTailwindConfig(
    configPath: string,
): Promise<TailwindConfigResult> {
    const resolvedPath = path.resolve(configPath);
    const { config } = await loadConfig({
        configFile: resolvedPath,
    });
    if (config === null) {
        return {
            success: false,
            data: null,
        };
    }
    const resolvedConfig = resolveTwConfig(config as any);
    return {
        success: true,
        data: resolvedConfig,
    };
}

export function tailwindConfigToDartString(
    config: ReturnType<typeof resolveTwConfig>,
    options: CodegenOptions = {},
): string {
    const startingContext: CodegenContext = {
        instancePath: "",
        classPrefix: options.classPrefix ?? "",
        remValue: options.remValue ?? 16,
    };
    const parts = [
        "// this file was autogenerated by tailwind-to-dart",
        "// see https://github.com/joshmossas/tailwind-to-dart for details",
        "// ignore_for_file: type=lint",
        'import "dart:ui";',
        "",
        tailwindColorObjectToDartClass(
            config.theme.colors as unknown as TwValueObject,
            startingContext,
        ).content,
        "",
        tailwindFontSizeObjectToDartClass(
            config.theme.fontSize,
            startingContext,
        ).content,
        "",
        tailwindSizeValueObjectToDartClass(
            "Spacing",
            "size",
            "spacing",
            config.theme.spacing as unknown as TwValueObject,
            startingContext,
        ).content,
        "",
        tailwindSizeValueObjectToDartClass(
            "LineHeight",
            "size",
            "line-height",
            config.theme.lineHeight,
            startingContext,
        ).content,
        "",
        tailwindSizeValueObjectToDartClass(
            "LetterSpacing",
            "size",
            "letter-spacing",
            config.theme.letterSpacing,
            startingContext,
        ).content,
        "",
        tailwindSizeValueObjectToDartClass(
            "BorderRadius",
            "size",
            "border-radius",
            config.theme.borderRadius,
            startingContext,
        ).content,
        "",
        tailwindSizeValueObjectToDartClass(
            "BorderWidth",
            "size",
            "border-width",
            config.theme.borderWidth,
            startingContext,
        ).content,
    ];
    return parts.join("\n");
}

type TwValueObject = Record<string, Record<string, any> | string>;

export function tailwindColorObjectToDartClass(
    input: TwValueObject,
    context: CodegenContext,
): { className: string; content: string } {
    const isRoot = context.instancePath.length === 0;
    const className = isRoot
        ? `${context.classPrefix}Colors`
        : `_${pascalCase(context.instancePath.split("/").join("_"), { normalize: true })}`;
    const colorParts: string[] = [];
    const colorSubParts: string[] = [];
    const requireKeyPrefix = hasUnsafeKey(Object.keys(input));
    for (const [key, val] of Object.entries(input)) {
        if (typeof val === "string") {
            const fieldPrefix = isRoot ? "static const" : "final";
            const valuePrefix = isRoot ? "" : "const ";

            if (val.startsWith("#")) {
                const finalVal =
                    val.length === 4
                        ? `0xFF${val.replace("#", "").toUpperCase()}${val.replace("#", "").toUpperCase()}`
                        : `0xFF${val.replace("#", "").toUpperCase()}`;
                colorParts.push(`/// ${val}`);
                colorParts.push(
                    `${fieldPrefix} ${dartSafeKey(key, "shade", requireKeyPrefix)} = ${valuePrefix}Color(${finalVal});`,
                );
                continue;
            }
            if (val.startsWith("rgb(")) {
                colorParts.push(`/// ${val}`);
                colorParts.push(
                    `${fieldPrefix} ${dartSafeKey(key, "shade", requireKeyPrefix)} = ${valuePrefix}${rgbStringToDartColor(val)};`,
                );
                continue;
            }
            if (val.startsWith("rgba(")) {
                colorParts.push(`/// ${val}`);
                colorParts.push(
                    `${fieldPrefix} ${dartSafeKey(key, "shade", requireKeyPrefix)} = ${valuePrefix}${rgbaStringToDartColor(val)};`,
                );
                continue;
            }
            if (val.toLowerCase() === "transparent") {
                colorParts.push(
                    `${fieldPrefix} ${dartSafeKey(key, "shade", requireKeyPrefix)} = ${valuePrefix}Color.fromARGB(0, 0, 0, 0);`,
                );
                continue;
            }
            consola.warn(`Unsupported color: "${val}"`);
            continue;
        }
        if (typeof val === "object") {
            const result = tailwindColorObjectToDartClass(
                val as TwValueObject,
                {
                    classPrefix: context.classPrefix,
                    instancePath:
                        context.instancePath.length > 0
                            ? `${context.instancePath}/${key}`
                            : `${className}/${key}`,
                    remValue: context.remValue,
                },
            );
            const fieldPrefix = isRoot ? "static const" : "final";
            const valuePrefix = isRoot ? "" : "const ";
            colorParts.push(
                `${fieldPrefix} ${dartSafeKey(key, "shade", false)} = ${valuePrefix}${result.className}();`,
            );
            colorSubParts.push(result.content);
            continue;
        }
    }
    const content = [`class ${className} {`, `  const ${className}();`];
    for (const part of colorParts) {
        content.push(`  ${part}`);
    }
    content.push("}");
    for (const part of colorSubParts) {
        content.push("");
        content.push(part);
    }
    return {
        className,
        content: content.join("\n"),
    };
}

export const illegalChars = "0123456789";

export function tailwindFontSizeObjectToDartClass(
    input: TwValueObject,
    context: CodegenContext,
): { className: string; content: string } {
    const isRoot = context.instancePath.length === 0;
    const className = isRoot
        ? `${context.classPrefix}FontSizes`
        : `_${pascalCase(context.instancePath.split("/").join("_"), { normalize: true })}`;
    const parts: string[] = [];
    const subParts: string[] = [];
    const fieldPrefix = isRoot ? `static const` : `final`;
    const requireKeyPrefix = hasUnsafeKey(Object.keys(input));
    for (const [key, value] of Object.entries(input)) {
        if (typeof value === "string") {
            const pxValue = sizeInputToDouble(value, context.remValue);
            parts.push(`/// fontSize: ${pxValue}px`);
            parts.push(
                `${fieldPrefix} double ${dartSafeKey(key, "size", requireKeyPrefix)} = ${pxValue};`,
            );
            continue;
        }
        if (Array.isArray(value)) {
            const pxValue = sizeInputToDouble(
                value[0] as string,
                context.remValue,
            );
            const fieldPrefix = isRoot ? `static const` : `final`;
            parts.push(`/// fontSize: ${pxValue}px`);
            parts.push(
                `${fieldPrefix} double ${dartSafeKey(key, "size", requireKeyPrefix)} = ${pxValue};`,
            );
            continue;
        }
        if (typeof value === "object") {
            const result = tailwindFontSizeObjectToDartClass(
                value as TwValueObject,
                {
                    instancePath:
                        context.instancePath.length > 0
                            ? `${context.instancePath}/${key}`
                            : `${className}/${key}`,
                    remValue: context.remValue,
                    classPrefix: context.classPrefix,
                },
            );
            const valuePrefix = isRoot ? `` : "const ";
            parts.push(
                `${fieldPrefix} ${result.className} ${dartSafeKey(key, "size", requireKeyPrefix)} = ${valuePrefix}${result.className}();`,
            );
            subParts.push(result.content);
            continue;
        }
        consola.warn(`Unsupported font-size: "${JSON.stringify(value)}"`);
    }
    const content = [`class ${className} {`, `  const ${className}();`];
    for (const part of parts) {
        content.push(`  ${part}`);
    }
    content.push("}");
    for (const part of subParts) {
        content.push("");
        content.push(part);
    }
    return {
        className,
        content: content.join("\n"),
    };
}

export function tailwindSizeValueObjectToDartClass(
    classSuffix: string,
    fieldSuffix: string,
    commentName: string,
    input: TwValueObject,
    context: CodegenContext,
): { className: string; content: string } {
    const isRoot = context.instancePath.length === 0;
    const className = getClassName(context, classSuffix);
    const parts: string[] = [];
    const subParts: string[] = [];
    const fieldPrefix = isRoot ? `static const` : "final";
    const requireKeyPrefix = hasUnsafeKey(Object.keys(input));
    for (const [key, val] of Object.entries(input)) {
        if (typeof val === "string") {
            const pxValue = sizeInputToDouble(val, context.remValue);
            parts.push(`/// ${commentName}: ${pxValue}`);
            parts.push(
                `${fieldPrefix} double ${dartSafeKey(key, fieldSuffix, requireKeyPrefix)} = ${pxValue};`,
            );
            continue;
        }
        if (typeof val === "object") {
            const result = tailwindSizeValueObjectToDartClass(
                classSuffix,
                fieldSuffix,
                commentName,
                val,
                {
                    instancePath: isRoot
                        ? `${className}/${key}`
                        : `${context.instancePath}/key`,
                    classPrefix: context.classPrefix,
                    remValue: context.remValue,
                },
            );
            parts.push(
                `${fieldPrefix} ${dartSafeKey(key, fieldSuffix, false)} = ${result.className}();`,
            );
            subParts.push(result.content);
            continue;
        }
        consola.warn(`Unsupported ${commentName}: "${JSON.stringify(val)}"`);
    }
    const content = [`class ${className} {`, `  const ${className}();`];
    for (const part of parts) {
        content.push(`  ${part}`);
    }
    content.push(`}`);
    for (const part of subParts) {
        content.push("");
        content.push(part);
    }
    return {
        className,
        content: content.join("\n"),
    };
}

function getClassName(context: CodegenContext, suffix: string): string {
    const isRoot = context.instancePath.length === 0;
    const className = isRoot
        ? `${context.classPrefix}${suffix}`
        : `_${pascalCase(context.instancePath.split("/").join("_"), { normalize: true })}`;
    return className;
}

function hasUnsafeKey(keys: string[]): boolean {
    for (const key of keys) {
        for (const char of illegalChars) {
            if (key.startsWith(char)) {
                return true;
            }
        }
    }
    return false;
}

function dartSafeKey(
    key: string,
    fallbackPrefix: string,
    prefixIsRequired: boolean,
): string {
    let finalKey = key;
    if (finalKey.includes(".")) {
        finalKey = finalKey.replaceAll(".", "_point_");
    }
    if (prefixIsRequired) {
        return camelCase(`${fallbackPrefix}_${finalKey}`);
    }
    for (const char of illegalChars) {
        if (finalKey.startsWith(char)) {
            finalKey = `${fallbackPrefix}_${finalKey}`;
        }
    }
    if (finalKey.toLowerCase() === "default") {
        finalKey = `${fallbackPrefix}_${finalKey}`;
    }

    return camelCase(finalKey, {
        normalize: true,
    });
}

export function sizeInputToDouble(input: string, remValue: number): number {
    let pxValue = 0;
    if (input.includes("rem")) {
        pxValue = Number(input.replace("rem", "")) * remValue;
    } else if (input.includes("em")) {
        pxValue = Number(input.replace("em", "")) * remValue;
    } else if (input.includes("px")) {
        pxValue = Number(input.replace("px", ""));
    } else {
        pxValue = Number(input.trim());
    }
    return pxValue;
}

export function rgbStringToDartColor(input: string): string | null {
    const trimmedInput = input.trim();
    if (!trimmedInput.startsWith("rgb(")) {
        return null;
    }
    const splitter = trimmedInput.includes(",") ? `,` : " ";
    const [r, g, b] = trimmedInput
        .replace(`rgb(`, "")
        .replace(")", "")
        .trim()
        .split(splitter)
        .map((str) => Number(str.trim()));
    if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
        return null;
    }
    return `Color.fromRGBO(${r}, ${g}, ${b}, 1)`;
}

export function rgbaStringToDartColor(input: string): string | null {
    const trimmedInput = input.trim();
    if (!trimmedInput.startsWith("rgba(")) {
        return null;
    }
    const splitter = trimmedInput.includes(",") ? `,` : " ";
    const [r, g, b, a] = trimmedInput
        .replace("rgba(", "")
        .replace(")", "")
        .trim()
        .split(splitter)
        .map((str) => Number(str.trim()));
    if (
        Number.isNaN(r) ||
        Number.isNaN(g) ||
        Number.isNaN(b) ||
        Number.isNaN(a)
    ) {
        return null;
    }
    return `Color.fromRGBO(${r}, ${g}, ${b}, ${a})`;
}
