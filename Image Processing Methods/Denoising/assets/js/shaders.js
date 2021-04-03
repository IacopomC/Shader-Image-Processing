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
    uniform int kernelSize;
    uniform float percent;
    
    varying vec2 vUv;

    float neighbors[MAX_SIZE];
    
    void main(void) {

      vec2 cellSize = 1.0 / resolution.xy;
      vec2 uv = vUv.xy;

      vec4 textureValue = vec4(0.0);

      float k = (float(kernelSize) - 1.0) / 2.0;
      int counter = 0;
      for (float i = -k; i <= k; i++) {
        for (float j = -k; j <= k; j++) {
					neighbors[counter] =
                float(texture2D( image, uv + vec2( float(i)*cellSize.x, float(j)*cellSize.y ) ));
          counter++;
          //textureValue += texture2D( image, uv + vec2( float(i)*cellSize.x, float(j)*cellSize.y ) );
        }
      }

      for(int i = 0; i < counter; i++){
     
        // Last i elements are already in place  
        for(int j = 0; j < ( counter - i -1 ); j++){
            
          // Checking if the item at present iteration 
          // is greater than the next iteration
          if(neighbors[j] > neighbors[j+1]){
              
            // If the condition is true then swap them
            float temp = neighbors[j];
            neighbors[j] = neighbors[j + 1];
            neighbors[j+1] = temp;
          }
        }
      }

      int medianIndx = 0;

      if (counter % 2 == 0){
        medianIndx = counter / 2;
      }
      else {
        medianIndx = (counter + 1) / 2;
      }

      int numEl = (counter * int(percent) / 100) / 2;

      for (int j = (medianIndx - numEl); j <= (medianIndx - numEl); j++) {
        textureValue += neighbors[j];
      }

      textureValue /= float(numEl);
              
      gl_FragColor = vec4(textureValue.rgb, 1.0);
    }
    `

export {vertexShader, fragmentShader}
