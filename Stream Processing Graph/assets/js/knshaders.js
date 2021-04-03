const knvertexShader = 
    `
    varying vec2 vUv;

    void main() {
      vUv = vec2( uv.x, 1.0-uv.y );
      gl_Position = projectionMatrix *
        modelViewMatrix * vec4(position, 1.0 );
    }
`

const knfragmentShader = 
    `
    precision highp float;
    
    uniform sampler2D image;
    uniform vec2 resolution;
    uniform int kernelSize;
    uniform float percent;
    
    varying vec2 vUv;

    float rNeighbors[MAX_SIZE];
    float gNeighbors[MAX_SIZE];
    float bNeighbors[MAX_SIZE];
    
    void main(void) {

      vec2 cellSize = 1.0 / resolution.xy;
      vec2 uv = vUv.xy;

      float rValue = 0.0;
      float gValue = 0.0;
      float bValue = 0.0;

      float k = (float(kernelSize) - 1.0) / 2.0;
      int counter = 0;
      for (float i = -k; i <= k; i++) {
        for (float j = -k; j <= k; j++) {
					rNeighbors[counter] =
                float(texture2D( image, uv + vec2( float(i)*cellSize.x, float(j)*cellSize.y ) ).r);
          gNeighbors[counter] =
                float(texture2D( image, uv + vec2( float(i)*cellSize.x, float(j)*cellSize.y ) ).g);
          bNeighbors[counter] =
                float(texture2D( image, uv + vec2( float(i)*cellSize.x, float(j)*cellSize.y ) ).b);
          counter++;
          //textureValue += texture2D( image, uv + vec2( float(i)*cellSize.x, float(j)*cellSize.y ) );
        }
      }

      for(int i = 0; i < counter; i++){
     
        // Last i elements are already in place  
        for(int j = 0; j < ( counter - i -1 ); j++){
            
          // Checking if the item at present iteration 
          // is greater than the next iteration
          if(rNeighbors[j] > rNeighbors[j+1]){
              
            // If the condition is true then swap them
            float temp = rNeighbors[j];
            rNeighbors[j] = rNeighbors[j + 1];
            rNeighbors[j+1] = temp;
          }

          if(gNeighbors[j] > gNeighbors[j+1]){
              
            // If the condition is true then swap them
            float temp = gNeighbors[j];
            gNeighbors[j] = gNeighbors[j + 1];
            gNeighbors[j+1] = temp;
          }

          if(bNeighbors[j] > bNeighbors[j+1]){
              
            // If the condition is true then swap them
            float temp = bNeighbors[j];
            bNeighbors[j] = bNeighbors[j + 1];
            bNeighbors[j+1] = temp;
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
        rValue += rNeighbors[j];
        gValue += gNeighbors[j];
        bValue += bNeighbors[j];
      }

      vec3 textureValue = vec3 (rValue, gValue, bValue);

      textureValue /= float(numEl);
              
      gl_FragColor = vec4(textureValue, 1.0);
    }
    `

export {knvertexShader, knfragmentShader}
