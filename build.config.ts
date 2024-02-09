import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
    entries: ["./src/main.ts", "./src/cli.ts"],
    declaration: true,
    clean: true,
    failOnWarn: false,
    rollup: {
        dts: {
            respectExternal: true,
        },
    },
    outDir: "dist",
});
