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
    uniform float sigma;
    
    varying vec2 vUv;

    const float Pi = 3.1415926538;
    
    void main(void) {

      vec2 uv = vUv.xy;

      vec4 textureValue = vec4(0.0);

      float firstTerm = 0.0;
      float secondTerm = 0.0;
      float k = (kernelSize - 1.0) / 2.0;
        
      for (float i = 1.0; i <= kernelSize; i++) {
        for (float j = 1.0; j <= kernelSize; j++) {
          firstTerm = (i-(k+1.0))*(i-(k+1.0));
          secondTerm = (j-(k+1.0))*(j-(k+1.0));
          textureValue += texture2D( image, uv + vec2(exp(-(firstTerm + secondTerm)/(sigma*sigma))));
        }
      }
      
      textureValue /= (2.0*Pi*sigma*sigma);
        
      gl_FragColor = textureValue;
    }
    `

export {vertexShader, fragmentShader}
