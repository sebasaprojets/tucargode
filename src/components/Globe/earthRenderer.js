/**
 * Renderizador fotorrealista de la Tierra en WebGL (sin dependencias).
 *
 * Un único triángulo a pantalla completa; el fragment shader hace el "raycast"
 * ortográfico contra la esfera y muestrea texturas equirectangulares de la NASA
 * (Blue Marble de día, Black Marble de noche y máscara de océanos).
 *
 * Iluminación cinematográfica: el sol viene de arriba a la izquierda (relativo a
 * la cámara), así el borde derecho queda en crepúsculo y se encienden las luces
 * de las ciudades. Reflejo especular en el agua y atmósfera con efecto Fresnel.
 */

const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;
uniform vec2 uCenter;      // px de dispositivo, origen abajo-izquierda
uniform float uRadius;     // px de dispositivo
uniform vec3 uE;           // eje este de la cámara (mundo)
uniform vec3 uN;           // eje norte de la cámara (mundo)
uniform vec3 uC;           // hacia el espectador (mundo)
uniform vec3 uSun;         // dirección del sol (mundo)
uniform float uAlpha;
uniform sampler2D uDay;
uniform sampler2D uNight;
uniform sampler2D uWater;

const float PI = 3.14159265359;

void main() {
  vec2 p = (gl_FragCoord.xy - uCenter) / uRadius;
  float d = length(p);
  float aa = 1.5 / uRadius;

  // Atmósfera exterior
  vec3 atmoColor = vec3(0.30, 0.58, 1.0);
  float halo = pow(max(0.0, 1.0 - (d - 1.0) / 0.32), 2.6) * step(1.0, d);
  vec4 glow = vec4(atmoColor * halo * 0.55, halo * 0.55);

  if (d > 1.0 + aa) {
    gl_FragColor = glow * uAlpha;
    return;
  }

  float z = sqrt(max(0.0, 1.0 - d * d));
  vec3 n = normalize(p.x * uE + p.y * uN + z * uC);
  float lat = asin(clamp(n.z, -1.0, 1.0));
  float lon = atan(n.y, n.x);
  vec2 uv = vec2(lon / (2.0 * PI) + 0.5, 0.5 - lat / PI);

  vec3 day = texture2D(uDay, uv).rgb;
  vec3 night = texture2D(uNight, uv).rgb;
  float water = texture2D(uWater, uv).r;

  float sunDot = dot(n, uSun);
  float dayMix = smoothstep(-0.12, 0.22, sunDot);

  // Grading de marca: día un poco más frío y profundo
  day = pow(day, vec3(1.12)) * vec3(0.86, 0.96, 1.08);
  vec3 lit = day * (0.1 + 0.95 * pow(max(sunDot, 0.0), 0.8));

  // Noche: azul profundo + luces de ciudad cálidas
  // En la textura nocturna las ciudades tienen el canal rojo alto; desiertos y océano son azulados (rojo bajo)
  float lights = smoothstep(0.12, 0.42, night.r);
  vec3 nightCol = vec3(0.012, 0.04, 0.085) + night * vec3(0.12, 0.16, 0.24) + vec3(1.0, 0.76, 0.42) * lights * 1.7;

  vec3 col = mix(nightCol, lit, dayMix);

  // Banda de crepúsculo ligeramente cálida
  float dusk = smoothstep(-0.2, 0.0, sunDot) * (1.0 - smoothstep(0.0, 0.22, sunDot));
  col += vec3(0.55, 0.25, 0.12) * dusk * 0.18 * (1.0 - water * 0.5);

  // Reflejo especular del sol en el océano
  vec3 h = normalize(uSun + uC);
  float spec = pow(max(dot(n, h), 0.0), 140.0) * water * dayMix;
  col += vec3(0.85, 0.92, 1.0) * spec * 0.25;

  // Fresnel / atmósfera interior
  float rim = pow(1.0 - z, 2.4);
  col = mix(col, atmoColor * (0.35 + 0.65 * dayMix), rim * 0.7);

  float edge = 1.0 - smoothstep(1.0 - aa, 1.0 + aa, d);
  vec4 planet = vec4(col, 1.0) * edge;
  gl_FragColor = (planet + glow * (1.0 - edge)) * uAlpha;
}
`;

function compile(gl, type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(s);
    gl.deleteShader(s);
    throw new Error(log);
  }
  return s;
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * @returns {null | { ready: Promise<void>, render(params): void, resize(w,h,dpr): void, destroy(): void }}
 */
export function createEarthRenderer(canvas, textures) {
  const gl =
    canvas.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: false }) ||
    canvas.getContext('experimental-webgl');
  if (!gl) return null;

  let program;
  try {
    program = gl.createProgram();
    gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERT));
    gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
  } catch {
    return null;
  }
  gl.useProgram(program);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(program, 'aPos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const u = {};
  ['uCenter', 'uRadius', 'uE', 'uN', 'uC', 'uSun', 'uAlpha', 'uDay', 'uNight', 'uWater'].forEach((k) => {
    u[k] = gl.getUniformLocation(program, k);
  });

  const aniso =
    gl.getExtension('EXT_texture_filter_anisotropic') || gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic');

  const makeTexture = (img, unit) => {
    const tex = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    if (aniso) gl.texParameterf(gl.TEXTURE_2D, aniso.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(8, gl.getParameter(aniso.MAX_TEXTURE_MAX_ANISOTROPY_EXT)));
    return tex;
  };

  let loaded = false;
  let lost = false;
  const ready = Promise.all([loadImage(textures.day), loadImage(textures.night), loadImage(textures.water)]).then(
    ([day, night, water]) => {
      if (lost) throw new Error('context lost');
      makeTexture(day, 0);
      makeTexture(night, 1);
      makeTexture(water, 2);
      gl.uniform1i(u.uDay, 0);
      gl.uniform1i(u.uNight, 1);
      gl.uniform1i(u.uWater, 2);
      loaded = true;
    },
  );

  const onLost = (e) => {
    e.preventDefault();
    lost = true;
    loaded = false;
  };
  canvas.addEventListener('webglcontextlost', onLost);

  gl.disable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

  return {
    ready,
    get usable() {
      return loaded && !lost;
    },
    resize(w, h, dpr) {
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      gl.viewport(0, 0, canvas.width, canvas.height);
    },
    /** cx, cy, R en px CSS (origen arriba-izquierda), cam = {e,n,c}, sun = vec3 mundo */
    render({ cx, cy, R, cam, sun, alpha, H, dpr }) {
      if (!loaded || lost) return;
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(u.uCenter, cx * dpr, (H - cy) * dpr);
      gl.uniform1f(u.uRadius, R * dpr);
      gl.uniform3fv(u.uE, cam.e);
      gl.uniform3fv(u.uN, cam.n);
      gl.uniform3fv(u.uC, cam.c);
      gl.uniform3fv(u.uSun, sun);
      gl.uniform1f(u.uAlpha, alpha);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
    destroy() {
      canvas.removeEventListener('webglcontextlost', onLost);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    },
  };
}
