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
    uniform float kernelSize;
    
    varying vec2 vUv;

    const float Pi = 3.1415926538;
    
    void main(void) {

      vec2 cellSize = 1.0 / resolution.xy;
      vec2 uv = vUv.xy;

      vec4 textureValue = vec4(0.0);

      float sigma = sqrt(-(kernelSize * kernelSize)/(2.0 * log(1.0/255.0)));
      float k = (kernelSize - 1.0) / 2.0;
      
      // iterate over rows
      for (float i = -k; i <= k; i++) {
        float x = uv.x + float(i) * cellSize.x;
        textureValue += texture2D(image, vec2(uv.x, exp(-(x*x + uv.y*uv.y)/(sigma*sigma))));
      }

      // iterate over columns
      for (float j = -k; j <= k; j++) {
        float y = uv.y + float(j) * cellSize.y;
        textureValue += texture2D(image, vec2(uv.x, exp(-(y*y + uv.x*uv.x)/(sigma*sigma))));
      }
      
      textureValue /= (2.0*Pi*sigma*sigma);
        
      gl_FragColor = textureValue;
    }
    `

export {vertexShader, fragmentShader}
