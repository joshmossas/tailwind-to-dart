import unjs from "eslint-config-unjs";
import prettier from "eslint-config-prettier";
export default unjs(
    {
        rules: {
            "unicorn/no-null": 0,

        },
    },
    prettier,
);
