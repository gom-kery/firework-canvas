(function setupImageUpload() {
  const MAX_FILE_SIZE = 10 * 1024 * 1024;
  const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
  const allowedExtensions = new Set(["jpg", "jpeg", "png", "webp"]);
  const state = window.fireworkState;
  const input = document.getElementById("imageInput");
  const uploadButton = document.getElementById("uploadButton");
  const changeButton = document.getElementById("changeButton");
  const deleteButton = document.getElementById("deleteButton");
  const preview = document.getElementById("imagePreview");
  const placeholder = document.getElementById("uploadPlaceholder");
  const errorMessage = document.getElementById("errorMessage");
  const canvasLabel = document.getElementById("canvasLabel");
  const previewButton = document.getElementById("previewButton");
  const pickCanvas = document.createElement("canvas");
  const pickContext = pickCanvas.getContext("2d", { willReadFrequently: true });
  let loadSequence = 0;

  pickCanvas.width = 1;
  pickCanvas.height = 1;

  function showError(message) { errorMessage.textContent = message; errorMessage.hidden = false; }
  function clearError() { errorMessage.textContent = ""; errorMessage.hidden = true; }
  function isAllowedImage(file) { return allowedTypes.has(file.type) || allowedExtensions.has(file.name.split(".").pop().toLowerCase()); }
  function resetImageState() {
    if (state.imageObjectUrl) URL.revokeObjectURL(state.imageObjectUrl);
    state.image = null; state.imageWidth = 0; state.imageHeight = 0; state.imageObjectUrl = null;
    state.particles = []; state.pickedColor = null; state.palette = []; state.particleBuildMs = 0;
    state.playing = false; state.recording = false; state.previewReady = false;
    const swatches = document.getElementById("paletteSwatches");
    swatches.replaceChildren(); swatches.hidden = true;
    if (window.resetColorMode) window.resetColorMode();
  }
  function showUploadedImage(image, objectUrl) {
    if (state.playing && window.stopFireworkSequence) window.stopFireworkSequence();
    const startedAt = performance.now();
    const particles = window.createParticlesFromImage(image);
    if (state.imageObjectUrl) URL.revokeObjectURL(state.imageObjectUrl);
    state.image = image; state.imageWidth = image.naturalWidth; state.imageHeight = image.naturalHeight; state.imageObjectUrl = objectUrl;
    state.particles = particles; state.palette = []; state.pickedColor = null; state.colorMode = "original"; state.particleBuildMs = performance.now() - startedAt; state.previewReady = true;
    preview.src = objectUrl; preview.hidden = false; placeholder.hidden = true; canvasLabel.hidden = true;
    changeButton.disabled = false; deleteButton.disabled = false;
    previewButton.disabled = false;
    window.applyColorMode(state.colorMode, document.querySelector('[data-color-mode="original"]'));
  }
  function loadImage(file) {
    if (!isAllowedImage(file)) { showError("지원하지 않는 이미지 형식입니다."); return; }
    if (file.size > MAX_FILE_SIZE) { showError("이미지는 최대 10MB까지 사용할 수 있습니다."); return; }
    const requestId = ++loadSequence;
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => { if (requestId !== loadSequence) { URL.revokeObjectURL(objectUrl); return; } clearError(); showUploadedImage(image, objectUrl); };
    image.onerror = () => { URL.revokeObjectURL(objectUrl); if (requestId === loadSequence) showError("이미지를 불러올 수 없습니다."); };
    image.src = objectUrl;
  }
  function chooseImage() { input.click(); }
  function deleteImage() {
    if (state.playing && window.stopFireworkSequence) window.stopFireworkSequence();
    loadSequence += 1; resetImageState(); input.value = ""; preview.removeAttribute("src"); preview.hidden = true;
    placeholder.hidden = false; canvasLabel.hidden = false; changeButton.disabled = true; deleteButton.disabled = true; previewButton.disabled = true; clearError(); window.drawCanvasBackground();
  }
  window.updatePickPreviewState = function updatePickPreviewState() {
    preview.classList.toggle("is-picking", state.colorMode === "pick" && Boolean(state.image));
  };
  function pickColorAt(event) {
    if (state.colorMode !== "pick" || !state.image) return;
    const rect = preview.getBoundingClientRect();
    const scale = Math.min(rect.width / state.imageWidth, rect.height / state.imageHeight);
    const contentWidth = state.imageWidth * scale;
    const contentHeight = state.imageHeight * scale;
    const contentX = (rect.width - contentWidth) / 2;
    const contentY = (rect.height - contentHeight) / 2;
    const localX = event.clientX - rect.left - contentX;
    const localY = event.clientY - rect.top - contentY;
    if (localX < 0 || localY < 0 || localX >= contentWidth || localY >= contentHeight) return;
    const sourceX = Math.min(state.imageWidth - 1, Math.floor(localX / scale));
    const sourceY = Math.min(state.imageHeight - 1, Math.floor(localY / scale));
    pickContext.clearRect(0, 0, 1, 1);
    pickContext.drawImage(state.image, sourceX, sourceY, 1, 1, 0, 0, 1, 1);
    const [r, g, b, alpha] = pickContext.getImageData(0, 0, 1, 1).data;
    if (alpha < 32) return;
    window.applyPickedColor({ r, g, b });
  }
  uploadButton.addEventListener("click", chooseImage);
  changeButton.addEventListener("click", chooseImage);
  deleteButton.addEventListener("click", deleteImage);
  input.addEventListener("change", () => { const [file] = input.files; if (file) loadImage(file); input.value = ""; });
  preview.addEventListener("click", pickColorAt);
})();
