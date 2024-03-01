export const config = {
    name: 'handstandard',
    description: 'handstandard',
    functions: {
        drawShape: {
            parameters: {
                shape: {
                    type: 'string',
                    default: ''
                },
            }
        },
        changeBackground: {
            parameters: {
            }
        },
        removeBackground: {
            parameters: {
            }
        },
    }
}

export default config;