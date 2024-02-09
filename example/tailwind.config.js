/**
 * @type {import('tailwindcss').Config}
 */
module.exports = {
    theme: {
        extend: {
            colors: {
                "my-custom-color": "#123456",
                "my-custom-rgb-color": "rgb(1, 2, 3)",
                "my-custom-rgba-color": "rgba(1, 2, 3, 0.5)",
            },
        },
    },
};
