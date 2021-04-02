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
    uniform sampler2D image2;
    uniform vec2 resolution;
    uniform int operator;
    
    varying vec2 vUv;
    
    void main(void) {
      vec2 cellSize = 1.0 / resolution.xy;
      vec2 uv = vUv.xy;
    
      vec3 textureValue = vec3(0, 0, 0);
      vec3 textureValue2 = vec3(0, 0, 0);
      for (int i = -kernelSizeDiv2; i <= kernelSizeDiv2; i++){
        for (int j = -kernelSizeDiv2; j <= kernelSizeDiv2; j++) {
          textureValue += texture2D(image, uv + vec2(float(i) * cellSize.x, float(j) * cellSize.y)).rgb;
          textureValue2 += texture2D(image2, uv + vec2(float(i) * cellSize.x, float(j) * cellSize.y)).rgb;
        }
      }
      if(operator == 0) {
        textureValue += textureValue2;
        textureValue *= 0.5;
      } else if (operator == 1) {
        textureValue -= textureValue2;
      } else if (operator == 2) {
        textureValue *= textureValue2;
        textureValue *= 0.2;
      } else if (operator == 3) {
        textureValue /= textureValue2;
      }
      textureValue /= float((kernelSizeDiv2 * 2 + 1) * (kernelSizeDiv2 * 2 + 1));
      gl_FragColor = vec4 (textureValue, 1.0);
    }
    `

export {vertexShader, fragmentShader}
