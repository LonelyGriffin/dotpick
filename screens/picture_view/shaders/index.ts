// import passPositionVertex from "!!raw-loader!assets/shaders/pass_position_vertex.glsl";
// import fillFragment from "!!raw-loader!assets/shaders/fill_fragment.glsl";

export type TShaders = {
  passPositionVertex: string;
  fillFragment: string;
  toTapFragment: string;
  squareFigureFragment: string;
  squareFigureToFillFragment: string;
  expFragment: string;
};

export const loadShaders = async () => {
  // const passPositionVertex = await (await fetch(passPositionVertexUrl)).text();
  // const fillFragment = await (await fetch(fillFragmentUrl)).text();

  const passPositionVertex = `
varying vec2 v_Position;
varying vec2 v_NormalizedPosition;
void main() {
  v_Position = position.xy;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  v_NormalizedPosition = vec2(0.5 * (gl_Position.x + 1.0), 1.0 - 0.5 * (gl_Position.y + 1.0));
}
  `;

  const fillFragment = `
uniform vec4 u_Color;
void main() {
  gl_FragColor = u_Color;
}
`;

  const toTapFragment = `
uniform vec2 v_Position;
void main() {
  gl_FragColor = vec4(vec3(0.7), 1.0);
}
`;

  const expFragment = `
uniform vec4 u_Color;
uniform vec2 u_size;
uniform float u_cellSize;
uniform sampler2D u_Points;
varying vec2 v_Position;
varying vec2 v_NormalizedPosition;
void main() {
  float x = floor(v_NormalizedPosition.x * u_size.x);
  float y = floor(v_NormalizedPosition.y * u_size.y);
  float textureX = x / u_size.x;
  float textureY = y / u_size.y;
  vec4 texel = texture2D(u_Points, vec2(textureX, textureY));
  float data = texel.r * 255.0;
  if (data >= 1.5 && data <= 2.5) {
    gl_FragColor = u_Color;
  } else {
    gl_FragColor = vec4(vec3(0.0), 0.0);
  }
}
`;

  const squareFigureFragment = `
  uniform vec4 u_Color;
  uniform float u_Size;
  uniform float u_Amplitude;
  uniform vec2 u_Center;
  varying vec2 v_Position;
  void main() {
    float halfSize = 0.5 * u_Size;
    float dx = u_Center.x - v_Position.x;
    float dy = u_Center.y - v_Position.y;
    float normalizedX = abs(dx / halfSize);
    float normalizedY = abs(dy / halfSize);
    float normalized = normalizedX > normalizedY ? normalizedX : normalizedY;
  
    float figureBorder = 0.75;
    float shadowBorder = 0.92 + u_Amplitude * 0.08;
  
    if (normalized > shadowBorder) {
      gl_FragColor = vec4(0.0);
    } else {
      if (normalized > figureBorder) {
        gl_FragColor = mix(vec4(0.0), u_Color, (0.4 + u_Amplitude * 0.1) * (4.0 * normalized - 3.0));
      } else {
        gl_FragColor = u_Color;
      }
    }
  }
`;

  const squareFigureToFillFragment = `
  uniform vec4 u_Color;
  uniform float u_Size;
  uniform float u_FigureToFillPercent;
  uniform float u_InitialAmplitude;
  uniform vec2 u_Center;
  varying vec2 v_Position;
  void main() {
    float halfSize = 0.5 * u_Size + (u_FigureToFillPercent * 10000.0);
    float dx = u_Center.x - v_Position.x;
    float dy = u_Center.y - v_Position.y;
    float normalizedX = abs(dx / halfSize);
    float normalizedY = abs(dy / halfSize);
    float normalized = normalizedX > normalizedY ? normalizedX : normalizedY;
  
    float figureBorder = 0.75;
    float shadowBorder = 0.92 + u_InitialAmplitude * 0.08;
  
    if (normalized > shadowBorder) {
      gl_FragColor = vec4(0.0);
    } else {
      if (normalized > figureBorder) {
        gl_FragColor = mix(vec4(0.0), u_Color, (0.4 + u_InitialAmplitude * 0.1) * (4.0 * normalized - 3.0));
      } else {
        gl_FragColor = u_Color;
      }
    }
  }
`;

  return {
    passPositionVertex,
    fillFragment,
    squareFigureFragment,
    squareFigureToFillFragment,
    toTapFragment,
    expFragment,
  };
};
