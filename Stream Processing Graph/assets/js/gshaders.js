const gvertexShader =
  `
    varying vec2 vUv;

    void main() {
      vUv = vec2( uv.x, 1.0-uv.y );
      gl_Position = projectionMatrix *
        modelViewMatrix * vec4(position, 1.0 );
    }
`

const gfragmentShader =
  `
    precision highp float;
    
    uniform sampler2D image;
    uniform vec2 resolution;
    uniform float kernelSize;
    uniform float sigma;
    uniform bool horPass;
    
    varying vec2 vUv;

    const float Pi = 3.1415926538;
    
    void main(void) {

      vec2 cellSize = 1.0 / resolution.xy;
      vec2 uv = vUv.xy;

      vec4 textureValue = vec4(0.0);

      float k = (kernelSize - 1.0) / 2.0;
      
      float kernelSum = 0.0;

      if (horPass) {
        for (float i = -k; i <= k; i++) {
          float x = uv.x + i * cellSize.x;
          textureValue += texture2D(image, vec2(x, uv.y)) * exp(-(i*i)/(2.0*sigma*sigma));
          kernelSum += exp(-(i*i)/(2.0*sigma*sigma));
        }
      }
      else{
        for (float j = -k; j <= k; j++) {
          float y = uv.y + j * cellSize.y;
          textureValue += texture2D(image, vec2(uv.x, y)) * exp(-(j*j)/(2.0*sigma*sigma));
          kernelSum += exp(-(j*j)/(2.0*sigma*sigma));
        }
      }
      
      textureValue /= kernelSum;
        
      gl_FragColor = textureValue;
    }
    `

export { gvertexShader, gfragmentShader }

