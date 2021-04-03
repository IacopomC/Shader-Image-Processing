const vertexShader = 
    `
    varying vec2 vUv;

    void main() {
      vUv = vec2( uv.x, 1.0-uv.y );
      gl_Position = projectionMatrix *
        modelViewMatrix * vec4(position, 1.0 );
    }
`

const fragmentShader = 
    `
    precision highp float;

    const int kernelSizeDiv2 = 2;
    
    uniform sampler2D image;
    uniform vec2 resolution;
    
    varying vec2 vUv;
    
    void main(void) {
      vec2 cellSize = 1.0 / resolution.xy;
      vec2 uv = vUv.xy;
        
      vec4 color00 = texture2D ( image, uv - vec2( cellSize.x, cellSize.y ) );
      vec4 color01 = texture2D ( image, uv + vec2( - cellSize.x, cellSize.y ) );
      vec4 color10 = texture2D ( image, uv + vec2( cellSize.x, - cellSize.y ) );
      vec4 color11 = texture2D ( image, uv + vec2( cellSize.x, cellSize.y ) );

      float x_diff = cellSize.x;
      float y_diff = cellSize.y;

      vec4 texColor = color01*(1.0-x_diff)*(1.0-y_diff) +  color11*(x_diff)*(1.0-y_diff)
                        + color00*(y_diff)*(1.0-x_diff) +  color10*(x_diff*y_diff);

      gl_FragColor = texColor;
    }
    `

export {vertexShader, fragmentShader}
