const vertexShader = 
    `
    varying vec2 vUv;
    uniform float scaleFactor;

    void main() {
      vUv = vec2( uv.x, 1.0-uv.y );
      gl_Position = projectionMatrix *
        modelViewMatrix * vec4(scaleFactor * position, 1.0 );
    }
`

const fragmentShader = 
    `
    precision highp float;

    const int kernelSizeDiv2 = 2;
    
    uniform sampler2D image;
    uniform vec2 resolution;
    uniform float scaleFactor;
    
    varying vec2 vUv;

    mat2 scale(float scaleFactor){
      return mat2(scaleFactor,0.0,
                  0.0, scaleFactor);
    }
    
    void main(void) {
      vec2 cellSize = 1.0 / resolution.xy;
      vec2 uv = vUv.xy;
    
      uv = scale(scaleFactor) * (uv - 0.5) + 0.5;
    
      vec4 textureValue = vec4(0, 0, 0, 0);
      for (int i = -kernelSizeDiv2; i <= kernelSizeDiv2; i++)
        for (int j = -kernelSizeDiv2; j <= kernelSizeDiv2; j++)
          textureValue += texture2D(image, uv + vec2(float(i) * cellSize.x, float(j) * cellSize.y));
      textureValue /= float((kernelSizeDiv2 * 2 + 1) * (kernelSizeDiv2 * 2 + 1));
      gl_FragColor = textureValue;
    }
    `

export {vertexShader, fragmentShader}
