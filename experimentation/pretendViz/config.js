export const config = {
    name: 'pretendViz',
    description: 'pretendViz',
    functions: {
      seriously: {
        parameters: {
          color: {
            description: 'color',
            type: 'color',
            default: "#ff0000"
          },
          size: {
            description: 'size',
            type: 'number',
            default: 0
          }
        }
      },
      render: {
        parameters: {}
      }
    }
  }

  export default config;