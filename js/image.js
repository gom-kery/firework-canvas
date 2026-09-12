(function setupImageUploadAndFraming() {
  const MAX_FILE_SIZE = 10 * 1024 * 1024;
  const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
  const allowedExtensions = new Set(["jpg", "jpeg", "png", "webp"]);
  const state = window.fireworkState;
  const input = document.getElementById("imageInput");
  const uploadButton = document.getElementById("uploadButton");
  const deleteButton = document.getElementById("deleteButton");
  const previewStage = document.getElementById("previewImageStage");
  const previewCanvas = document.getElementById("imagePreviewCanvas");
  const previewContext = previewCanvas.getContext("2d", { willReadFrequently: true });
  const framingControls = document.getElementById("framingControls");
  const zoomRange = document.getElementById("zoomRange");
  const errorMessage = document.getElementById("errorMessage");
  const canvasLabel = document.getElementById("canvasLabel");
  const previewButton = document.getElementById("previewButton");
  const pickCanvas = document.createElement("canvas");
  const pickContext = pickCanvas.getContext("2d", { willReadFrequently: true });
  let loadSequence = 0;
  let dragStart = null;
  pickCanvas.width = 1; pickCanvas.height = 1;

  function showError(message) { errorMessage.textContent = message; errorMessage.hidden = false; }
  function clearError() { errorMessage.textContent = ""; errorMessage.hidden = true; }
  function updateImageAction() { uploadButton.textContent = state.image ? "Change" : "Upload"; }
  function isAllowedImage(file) { return allowedTypes.has(file.type) || allowedExtensions.has(file.name.split(".").pop().toLowerCase()); }
  function drawCropOverlay() {
    if (state.framing.shape !== "circle") return;
    const radius = Math.min(previewCanvas.width, previewCanvas.height) / 2;
    previewContext.save(); previewContext.fillStyle = "rgba(4, 6, 16, .58)"; previewContext.beginPath(); previewContext.rect(0, 0, previewCanvas.width, previewCanvas.height); previewContext.arc(previewCanvas.width / 2, previewCanvas.height / 2, radius, 0, Math.PI * 2); previewContext.fill("evenodd");
    previewContext.strokeStyle = "rgba(220, 207, 255, .9)"; previewContext.lineWidth = 2; previewContext.beginPath(); previewContext.arc(previewCanvas.width / 2, previewCanvas.height / 2, radius, 0, Math.PI * 2); previewContext.stroke(); previewContext.restore();
  }
  window.renderImageFramingPreview = function renderImageFramingPreview() {
    if (!state.image) return;
    const source = window.getFramedSourceRect(state.image, previewCanvas.width, previewCanvas.height);
    previewContext.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
    previewContext.drawImage(state.image, source.x, source.y, source.width, source.height, 0, 0, previewCanvas.width, previewCanvas.height);
    drawCropOverlay();
  };
  function resetImageState() {
    if (state.imageObjectUrl) URL.revokeObjectURL(state.imageObjectUrl);
    state.image = null; state.imageWidth = 0; state.imageHeight = 0; state.imageObjectUrl = null; state.particles = [];
    state.pickedColor = null; state.palette = []; state.particleBuildMs = 0; state.playing = false; state.recording = false; state.previewReady = false;
    state.framing = { shape: "rect", zoom: 1, offsetX: 0, offsetY: 0 }; zoomRange.value = "1";
    const swatches = document.getElementById("paletteSwatches"); swatches.replaceChildren(); swatches.hidden = true;
    if (window.resetColorMode) window.resetColorMode();
  }
  function rebuildFramedParticles() {
    if (!state.image || state.playing) return;
    const startedAt = performance.now(); state.particles = window.createParticlesFromImage(state.image, state.particleMode); state.palette = [];
    state.particleBuildMs = performance.now() - startedAt; window.applyColorMode(state.colorMode); window.renderImageFramingPreview();
  }
  function showUploadedImage(image, objectUrl) {
    if (state.playing && window.stopFireworkSequence) window.stopFireworkSequence();
    if (state.imageObjectUrl) URL.revokeObjectURL(state.imageObjectUrl);
    state.image = image; state.imageWidth = image.naturalWidth; state.imageHeight = image.naturalHeight; state.imageObjectUrl = objectUrl;
    state.pickedColor = null; state.colorMode = "original"; state.framing = { shape: "rect", zoom: 1, offsetX: 0, offsetY: 0 }; zoomRange.value = "1";
    previewStage.hidden = false; framingControls.hidden = false; canvasLabel.hidden = true; deleteButton.disabled = false; previewButton.disabled = false; updateImageAction();
    rebuildFramedParticles(); window.applyColorMode("original", document.querySelector('[data-color-mode="original"]'));
  }
  function loadImage(file) {
    if (!isAllowedImage(file)) { showError("지원하지 않는 이미지 형식입니다."); return; }
    if (file.size > MAX_FILE_SIZE) { showError("이미지는 최대 10MB까지 사용할 수 있습니다."); return; }
    const requestId = ++loadSequence; const objectUrl = URL.createObjectURL(file); const image = new Image();
    image.onload = () => { if (requestId !== loadSequence) { URL.revokeObjectURL(objectUrl); return; } clearError(); showUploadedImage(image, objectUrl); };
    image.onerror = () => { URL.revokeObjectURL(objectUrl); if (requestId === loadSequence) showError("이미지를 불러올 수 없습니다."); };
    image.src = objectUrl;
  }
  function chooseImage() { input.click(); }
  function deleteImage() {
    if (state.playing && window.stopFireworkSequence) window.stopFireworkSequence();
    loadSequence += 1; resetImageState(); input.value = ""; previewStage.hidden = true; framingControls.hidden = true; canvasLabel.hidden = false;
    deleteButton.disabled = true; previewButton.disabled = true; updateImageAction(); clearError(); window.drawCanvasBackground();
  }
  window.updatePickPreviewState = function updatePickPreviewState() { previewCanvas.classList.toggle("is-picking", state.colorMode === "pick" && Boolean(state.image)); };
  function sourcePointFromEvent(event) {
    const rect = previewCanvas.getBoundingClientRect();
    const canvasX = (event.clientX - rect.left) * previewCanvas.width / rect.width;
    const canvasY = (event.clientY - rect.top) * previewCanvas.height / rect.height;
    if (canvasX < 0 || canvasY < 0 || canvasX >= previewCanvas.width || canvasY >= previewCanvas.height) return null;
    if (state.framing.shape === "circle") { const radius = Math.min(previewCanvas.width, previewCanvas.height) / 2; const dx = canvasX - previewCanvas.width / 2; const dy = canvasY - previewCanvas.height / 2; if (dx * dx + dy * dy > radius * radius) return null; }
    const source = window.getFramedSourceRect(state.image, previewCanvas.width, previewCanvas.height);
    return { x: Math.min(state.imageWidth - 1, Math.floor(source.x + canvasX / previewCanvas.width * source.width)), y: Math.min(state.imageHeight - 1, Math.floor(source.y + canvasY / previewCanvas.height * source.height)) };
  }
  function pickColorAt(event) {
    if (state.colorMode !== "pick" || !state.image) return;
    const point = sourcePointFromEvent(event); if (!point) return;
    pickContext.clearRect(0, 0, 1, 1); pickContext.drawImage(state.image, point.x, point.y, 1, 1, 0, 0, 1, 1);
    const [r, g, b, alpha] = pickContext.getImageData(0, 0, 1, 1).data; if (alpha >= 32) window.applyPickedColor({ r, g, b });
  }
  function clampOffset(value) { return Math.max(-1, Math.min(1, value)); }
  function startDrag(event) { if (!state.image || state.colorMode === "pick") return; dragStart = { x: event.clientX, y: event.clientY, offsetX: state.framing.offsetX, offsetY: state.framing.offsetY }; previewCanvas.setPointerCapture(event.pointerId); }
  function dragImage(event) {
    if (!dragStart) return;
    const rect = previewCanvas.getBoundingClientRect();
    state.framing.offsetX = clampOffset(dragStart.offsetX - (event.clientX - dragStart.x) / rect.width * 2);
    state.framing.offsetY = clampOffset(dragStart.offsetY - (event.clientY - dragStart.y) / rect.height * 2);
    window.renderImageFramingPreview();
  }
  function endDrag() { if (!dragStart) return; dragStart = null; rebuildFramedParticles(); }
  document.querySelectorAll("[data-crop-shape]").forEach((button) => button.addEventListener("click", () => { if (state.playing || !state.image) return; state.framing.shape = button.dataset.cropShape; document.querySelectorAll("[data-crop-shape]").forEach((item) => item.classList.toggle("is-selected", item === button)); rebuildFramedParticles(); }));
  zoomRange.addEventListener("input", () => { if (state.playing || !state.image) return; state.framing.zoom = Number(zoomRange.value); rebuildFramedParticles(); });
  uploadButton.addEventListener("click", chooseImage); deleteButton.addEventListener("click", deleteImage);
  input.addEventListener("change", () => { const [file] = input.files; if (file) loadImage(file); input.value = ""; });
  previewCanvas.addEventListener("click", pickColorAt); previewCanvas.addEventListener("pointerdown", startDrag); previewCanvas.addEventListener("pointermove", dragImage); previewCanvas.addEventListener("pointerup", endDrag); previewCanvas.addEventListener("pointercancel", endDrag);
})();
