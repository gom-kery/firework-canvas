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
  framing: { shape: "rect", zoom: 1, offsetX: 0, offsetY: 0 },
  composition: { scale: 1, offsetX: 0, offsetY: 0 },
  compositionBounds: null,
  background: { mode: "default", color: "#0b1026", image: null, imageObjectUrl: null },
  particleBuildMs: 0,
  formationProgress: 0,
  launchPointCount: 1,
  phase: "IDLE",
  playing: false,
  recording: false,
  recordedBlob: null,
  previewReady: false
};

window.fireworkCanvas = document.getElementById("fireworkCanvas");
window.fireworkContext = window.fireworkCanvas.getContext("2d");
window.drawCanvasBackground = function drawCanvasBackground() {
  const { fireworkCanvas: canvas, fireworkContext: context } = window;
  const background = window.fireworkState.background;
  if (background.mode === "image" && background.image) {
    const scale = Math.max(canvas.width / background.image.naturalWidth, canvas.height / background.image.naturalHeight);
    const width = background.image.naturalWidth * scale;
    const height = background.image.naturalHeight * scale;
    context.drawImage(background.image, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height);
    return;
  }
  if (background.mode === "solid") {
    context.fillStyle = background.color;
    context.fillRect(0, 0, canvas.width, canvas.height);
    return;
  }
  const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "#142456");
  gradient.addColorStop(1, "#03040b");
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);
};
window.drawCanvasBackground();

const CANVAS_PREVIEW_SIZES = { "1:1": { width: 720, height: 720 }, "3:4": { width: 720, height: 960 }, "4:3": { width: 960, height: 720 } };

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
  if (window.renderImageFramingPreview) window.renderImageFramingPreview();
}

(() => {
  const state = window.fireworkState;
  const canvas = window.fireworkCanvas;
  const controls = document.getElementById("compositionControls");
  const scaleInput = document.getElementById("compositionScale");
  const scaleValue = document.getElementById("compositionScaleValue");
  const resetButton = document.getElementById("compositionReset");
  let dragStart = null;
  let pendingRender = null;
  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  function updateScaleValue() { scaleValue.value = `${Math.round(state.composition.scale * 100)}%`; scaleValue.textContent = scaleValue.value; }
  function renderComposition() {
    pendingRender = null;
    if (!state.image || state.playing) return;
    rebuildParticlesForCanvas();
  }
  function requestCompositionRender() {
    if (pendingRender !== null) return;
    pendingRender = requestAnimationFrame(renderComposition);
  }
  function resetComposition() {
    state.composition = { scale: 1, offsetX: 0, offsetY: 0 };
    scaleInput.value = "1"; updateScaleValue();
  }
  window.resetFireworkComposition = resetComposition;
  window.setFireworkCompositionControlsVisible = (visible) => { controls.hidden = !visible; };
  window.getFireworkCompositionCenter = () => {
    const bounds = state.compositionBounds;
    return bounds ? { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 } : { x: canvas.width / 2, y: canvas.height * .48 };
  };
  scaleInput.addEventListener("input", () => {
    if (!state.image || state.playing) return;
    state.composition.scale = Number(scaleInput.value); updateScaleValue(); requestCompositionRender();
  });
  resetButton.addEventListener("click", () => { if (!state.image || state.playing) return; resetComposition(); requestCompositionRender(); });
  canvas.addEventListener("pointerdown", (event) => {
    if (!state.image || state.playing || !state.compositionBounds) return;
    const bounds = state.compositionBounds;
    const horizontalRange = Math.max((canvas.width - bounds.width) / 2, 1);
    const verticalRange = Math.max((canvas.height - bounds.height) / 2, 1);
    dragStart = { x: event.clientX, y: event.clientY, offsetX: state.composition.offsetX, offsetY: state.composition.offsetY, horizontalRange, verticalRange };
    canvas.setPointerCapture(event.pointerId); canvas.classList.add("is-composing");
  });
  canvas.addEventListener("pointermove", (event) => {
    if (!dragStart) return;
    const rect = canvas.getBoundingClientRect();
    const deltaX = (event.clientX - dragStart.x) * canvas.width / rect.width;
    const deltaY = (event.clientY - dragStart.y) * canvas.height / rect.height;
    state.composition.offsetX = clamp(dragStart.offsetX + deltaX / dragStart.horizontalRange, -1, 1);
    state.composition.offsetY = clamp(dragStart.offsetY + deltaY / dragStart.verticalRange, -1, 1);
    requestCompositionRender();
  });
  function endCompositionDrag() { if (!dragStart) return; dragStart = null; canvas.classList.remove("is-composing"); }
  canvas.addEventListener("pointerup", endCompositionDrag); canvas.addEventListener("pointercancel", endCompositionDrag);
  updateScaleValue();
})();

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
