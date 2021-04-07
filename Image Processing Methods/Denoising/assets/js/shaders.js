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

    float rNeighbors[MAX_SIZE];
    float gNeighbors[MAX_SIZE];
    float bNeighbors[MAX_SIZE];

    void sortArray(float array[MAX_SIZE], int n){
      float tmp;
      int i, j;
      for (i = 1; i < n; i++) {
        tmp = array[i];
        j = i - 1;

        while (j >= 0 && length(array[j]) > length(tmp)) {
          array[j + 1] = array[j];
          j = j - 1;
        }
        array[j + 1] = tmp;
      }
    }
    
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
        }
      }

      sortArray(rNeighbors, counter);
      
      sortArray(gNeighbors, counter);
      
      sortArray(bNeighbors, counter);
      
      int medianIndx = 0;

      if (counter % 2 == 0){
        medianIndx = counter / 2;
      }
      else {
        medianIndx = (counter + 1) / 2;
      }

      int numEl = (kernelSize*kernelSize * int(percent) / 100) / 2;

      for (int j = (medianIndx - numEl); j <= (medianIndx + numEl); j++) {
        rValue += rNeighbors[j];
        gValue += gNeighbors[j];
        bValue += bNeighbors[j];
      }

      vec3 textureValue = vec3 (rValue, gValue, bValue);

      if (numEl >= 1) {
        textureValue /= float(2*numEl);
      }
              
      gl_FragColor = vec4(textureValue, 1.0);
    }
    `

export {vertexShader, fragmentShader}
