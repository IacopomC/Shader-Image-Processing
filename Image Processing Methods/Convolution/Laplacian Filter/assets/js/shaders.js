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
    
    uniform sampler2D image;
    uniform vec2 resolution;
    
    varying vec2 vUv;

    float laplacian[9] = float[9](0.0, -1.0, 0.0, -1.0, 4.0, -1.0, 0.0, -1.0, 0.0);

    
    void main(void) {

      vec2 cellSize = 1.0 / resolution.xy;
      vec2 uv = vUv.xy;

      vec4 textureValue = vec4(0.0);

      int counter = 0;
      
      for (int i = -1; i <= 1; i++) {
        for (int j = -1; j <= 1; j++) {
					textureValue +=
                texture2D( image, uv + vec2( float(i)*cellSize.x, float(j)*cellSize.y ) ) *
                laplacian[counter];
                counter++;
        }
      }
              
      gl_FragColor = textureValue;
    }
    `

export {vertexShader, fragmentShader}
