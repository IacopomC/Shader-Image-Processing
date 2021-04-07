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

    float laplacian[9] = float[9](-1.0, -1.0, -1.0, -1.0, 8.0, -1.0, -1.0, -1.0, -1.0);

    
    void main(void) {

      vec2 cellSize = 1.0 / resolution.xy;
      vec2 uv = vUv.xy;

      vec3 textureValue = vec3(0.0);

      int counter = 0;
      
      for (int i = -1; i <= 1; i++) {
        for (int j = -1; j <= 1; j++) {
					textureValue +=
                texture2D( image, uv + vec2( float(i)*cellSize.x, float(j)*cellSize.y ) ).rgb *
                laplacian[counter];
                counter++;
        }
      }

      // this processing is done only for visualization only
      textureValue = abs(textureValue);
      
      // apply gamma correction
      float gamma = 2.2;
      textureValue = pow(textureValue, vec3(1.0/gamma));
      gl_FragColor = vec4 (textureValue, 1.0);
    }
    `

export {vertexShader, fragmentShader}
