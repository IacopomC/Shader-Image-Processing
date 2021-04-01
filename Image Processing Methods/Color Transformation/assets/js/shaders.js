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
    
    varying vec2 vUv;

    //----------------------CIE Lch----------------------
    const vec3 wref =  vec3(.95047, 1.0, 1.08883); 

    float xyzF(float t){ return mix(pow(t,1./3.), 7.787037*t + 0.139731, step(t,0.00885645)); }
    float xyzR(float t){ return mix(t*t*t , 0.1284185*(t - 0.139731), step(t,0.20689655)); }

    vec3 rgb2lch(in vec3 c)
    {
      c  *= mat3( 0.4124, 0.3576, 0.1805,
                  0.2126, 0.7152, 0.0722,
                    0.0193, 0.1192, 0.9505);
      c.x = xyzF(c.x/wref.x);
      c.y = xyzF(c.y/wref.y);
      c.z = xyzF(c.z/wref.z);
      vec3 lab = vec3(max(0.,116.0*c.y - 16.0), 500.0*(c.x - c.y), 200.0*(c.y - c.z)); 
      return vec3(lab.x, length(vec2(lab.y,lab.z)), atan(lab.z, lab.y));
    }

    vec3 lch2rgb(in vec3 c)
    {
        c = vec3(c.x, cos(c.z) * c.y, sin(c.z) * c.y);
        
        float lg = 1./116.*(c.x + 16.);
        vec3 xyz = vec3(wref.x*xyzR(lg + 0.002*c.y),
                wref.y*xyzR(lg),
                wref.z*xyzR(lg - 0.005*c.z));
        
        vec3 rgb = xyz*mat3( 3.2406, -1.5372,-0.4986,
                          -0.9689,  1.8758, 0.0415,
                          0.0557,  -0.2040, 1.0570);
        
        return rgb;
    }
    
    void main(void) {

			vec3 texColor = lch2rgb(rgb2lch(texture2D ( image, vUv ).rgb));
      gl_FragColor = vec4(texColor, 1.0);
        
    }
    `

export {vertexShader, fragmentShader}
