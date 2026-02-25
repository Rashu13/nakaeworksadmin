export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#f0f5fa',
                    100: '#e1ecf4',
                    200: '#c0d7e8',
                    300: '#9fc2db',
                    400: '#5e99c3',
                    500: '#1c3866', // Logo Navy Blue
                    600: '#19325c',
                    700: '#152a4d',
                    800: '#11223d',
                    900: '#0e1c32',
                },
                secondary: {
                    50: '#f8f9fa',
                    100: '#f1f3f5',
                    200: '#e9ecef',
                    300: '#dee2e6',
                    400: '#ced4da',
                    500: '#a6adb5', // Logo Silver
                    600: '#868e96',
                    700: '#495057',
                    800: '#343a40',
                    900: '#212529',
                }
            }
        },
    },
    plugins: [],
}
