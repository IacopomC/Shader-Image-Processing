const vertexShader = 
    `varying vec2 vUv;
		void main() {
			vUv = vec2( uv.x, 1.0-uv.y );
			gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0 );
		}`

const fragmentShader = 
    `precision highp float;
		const int kernelSizeDiv2 = 2;
		uniform sampler2D image;
		uniform int sizeDiv2;
		uniform vec2 resolution;
		uniform float colorScaleR;
		uniform float colorScaleG;
		uniform float colorScaleB;
		uniform bool invert;

		varying vec2 vUv;
		void main(void) {
			vec2 cellSize = 1.0 / resolution.xy;
			vec2 uv = vUv.xy;

			vec4 textureValue = vec4 ( 0,0,0,0 );
			for (int i=-sizeDiv2;i<=sizeDiv2;i++)
				for (int j=-sizeDiv2;j<=sizeDiv2;j++)
					textureValue += texture2D( image, uv + vec2( float(i)*cellSize.x, float(j)*cellSize.y ) );
					textureValue /= float ((sizeDiv2*2+1)*(sizeDiv2*2+1));
			if (invert)
			{
				gl_FragColor = vec4(vec3(colorScaleR,colorScaleG,colorScaleB),1.0)*textureValue;
				gl_FragColor.rgb = vec3 ( 1.0 ) - gl_FragColor.rgb;
			}
			else
				gl_FragColor = vec4(vec3(colorScaleR,colorScaleG,colorScaleB),1.0)*textureValue;
		}`

export {vertexShader, fragmentShader}
