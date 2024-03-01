const config = {
    name: 'Second Viz',
    description: 'Second Viz',
    functions: {
        cool: {
            parameters: {
                test: {
                    description: 'test',
                    type: 'string',
                    default: "hello world"
                }
            }
        },
        render: {
            parameters: {}
        }
    }
}

export default config;