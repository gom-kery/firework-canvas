window.fireworkState = {
  image: null,
  imageWidth: 0,
  imageHeight: 0,
  imageObjectUrl: null,
  particles: [],
  pickedColor: null,
  colorMode: "original",
  palette: [],
  particleMode: "normal",
  duration: 5,
  ratio: "1:1",
  particleBuildMs: 0,
  formationProgress: 0,
  launchPointCount: 1,
  phase: "IDLE",
  playing: false,
  recording: false,
  previewReady: false
};

window.fireworkCanvas = document.getElementById("fireworkCanvas");
window.fireworkContext = window.fireworkCanvas.getContext("2d");
window.drawCanvasBackground = function drawCanvasBackground() {
  const { fireworkCanvas: canvas, fireworkContext: context } = window;
  const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "#142456");
  gradient.addColorStop(1, "#03040b");
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);
};
window.drawCanvasBackground();

const CANVAS_PREVIEW_SIZES = { "1:1": { width: 720, height: 720 }, "9:16": { width: 720, height: 1280 } };

function updateOptionSelection(selector, activeButton) {
  document.querySelectorAll(selector).forEach((button) => button.classList.toggle("is-selected", button === activeButton));
}

function rebuildParticlesForCanvas() {
  const state = window.fireworkState;
  if (!state.image) { window.drawCanvasBackground(); return; }
  const startedAt = performance.now();
  state.particles = window.createParticlesFromImage(state.image, state.particleMode);
  state.palette = [];
  state.particleBuildMs = performance.now() - startedAt;
  window.applyColorMode(state.colorMode);
}

window.setCanvasRatio = function setCanvasRatio(ratio, button) {
  const state = window.fireworkState;
  if (state.playing || !CANVAS_PREVIEW_SIZES[ratio]) return;
  const size = CANVAS_PREVIEW_SIZES[ratio];
  state.ratio = ratio;
  window.fireworkCanvas.width = size.width;
  window.fireworkCanvas.height = size.height;
  window.fireworkContext = window.fireworkCanvas.getContext("2d");
  updateOptionSelection("[data-ratio]", button);
  rebuildParticlesForCanvas();
  if (window.refreshLaunchMarkers) window.refreshLaunchMarkers();
};

document.querySelectorAll("[data-duration]").forEach((button) => {
  button.addEventListener("click", () => {
    if (window.fireworkState.playing) return;
    window.fireworkState.duration = Number(button.dataset.duration);
    updateOptionSelection("[data-duration]", button);
  });
});
document.querySelectorAll("[data-ratio]").forEach((button) => {
  button.addEventListener("click", () => window.setCanvasRatio(button.dataset.ratio, button));
});
