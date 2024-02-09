#! /usr/bin/env node
import { defineCommand, runMain } from "citty";
import fs from "node:fs";
import child from "node:child_process";
import path from "pathe";
import { getResolvedTailwindConfig, tailwindConfigToDartString } from "./main";

const main = defineCommand({
    args: {
        config: {
            type: "string",
            alias: "C",
            required: true,
        },
        output: {
            type: "string",
            alias: "O",
            required: true,
        },
        classPrefix: {
            type: "string",
            description: "Add a prefix to the generated classes",
            default: "",
        },
        format: {
            type: "boolean",
            description:
                "When set to true the process will run 'dart format' on the generated code. You must have the dart sdk installed for this to work.",
            default: false,
        },
        remValue: {
            type: "string",
            description:
                "Value in pixels that represents 1 rem. (Default is 16)",
            default: "16",
        },
    },
    async run(context) {
        const resolvedConfig = await getResolvedTailwindConfig(
            context.args.config,
        );
        if (!resolvedConfig.success) {
            throw new Error(`Error loading config at ${context.args.config}`);
        }
        const remValue = Number(context.args.remValue);
        if (Number.isNaN(remValue)) {
            throw new Error(`--remValue must be a valid number`);
        }
        const dartStr = tailwindConfigToDartString(resolvedConfig.data, {
            remValue,
            classPrefix: context.args.classPrefix,
        });
        const outputPath = path.resolve(context.args.output);
        fs.writeFileSync(outputPath, dartStr);
        if (context.args.format) {
            child.execSync(`dart format ${outputPath}`);
        }
    },
});

void runMain(main);
