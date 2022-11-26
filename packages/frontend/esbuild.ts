import esbuild from "esbuild";
import { sassPlugin } from "esbuild-sass-plugin";

const config: esbuild.BuildOptions = {
    entryPoints: ["./src/index.tsx"],
    outfile: "./dist/assets/bundle.js",
    format: "esm",
    bundle: true,
    sourcemap: true,
    plugins: [sassPlugin()],
};

export default config;
