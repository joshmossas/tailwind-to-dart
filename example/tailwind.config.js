/**
 * @type {import('tailwindcss').Config}
 */
export default {
    theme: {
        extend: {
            colors: {
                "my-custom-color": "#123456",
                "my-custom-rgb-color": "rgb(1, 2, 3)",
                "my-custom-rgba-color": "rgba(1, 2, 3, 0.5)",
            },
            opacity: {
                "my-custom-opacity": {
                    foo: {
                        0: "0",
                        50: "0.5",
                        100: "100",
                    },
                    bar: {
                        light: "0.15",
                        medium: "0.5",
                        opaque: "1",
                    },
                },
            },
        },
    },
};
