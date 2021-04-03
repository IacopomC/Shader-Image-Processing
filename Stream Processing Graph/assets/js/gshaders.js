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
    
    varying vec2 vUv;

    const float Pi = 3.1415926538;
    
    void main(void) {

      vec2 cellSize = 1.0 / resolution.xy;
      vec2 uv = vUv.xy;

      vec4 textureValue = vec4(0.0);

      float k = (kernelSize - 1.0) / 2.0;
      
      float kernelSum = 0.0;
      for (float i = -k; i <= k; i++) {
        for (float j = -k; j <= k; j++) {
					textureValue +=
                texture2D( image, uv + vec2( float(i)*cellSize.x, float(j)*cellSize.y ) ) *
                exp(-(i*i + j*j)/(2.0*sigma*sigma));
          kernelSum += exp(-(i*i + j*j)/(2.0*sigma*sigma));
        }
      }
      
      textureValue /= kernelSum;
        
      gl_FragColor = textureValue;
    }
    `

export {gvertexShader, gfragmentShader}
