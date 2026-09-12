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
  let loadSequence = 0;

  function showError(message) { errorMessage.textContent = message; errorMessage.hidden = false; }
  function clearError() { errorMessage.textContent = ""; errorMessage.hidden = true; }
  function isAllowedImage(file) {
    const extension = file.name.split(".").pop().toLowerCase();
    return allowedTypes.has(file.type) || allowedExtensions.has(extension);
  }
  function drawImageOnCanvas(image) {
    const canvas = window.fireworkCanvas;
    const context = window.fireworkContext;
    const scale = Math.min(canvas.width / image.naturalWidth, canvas.height / image.naturalHeight);
    const width = image.naturalWidth * scale;
    const height = image.naturalHeight * scale;
    window.drawCanvasBackground();
    context.drawImage(image, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height);
  }
  function resetImageState() {
    if (state.imageObjectUrl) URL.revokeObjectURL(state.imageObjectUrl);
    state.image = null;
    state.imageWidth = 0;
    state.imageHeight = 0;
    state.imageObjectUrl = null;
    state.particles = [];
    state.pickedColor = null;
    state.playing = false;
    state.recording = false;
    state.previewReady = false;
  }
  function showUploadedImage(image, objectUrl) {
    if (state.imageObjectUrl) URL.revokeObjectURL(state.imageObjectUrl);
    state.image = image;
    state.imageWidth = image.naturalWidth;
    state.imageHeight = image.naturalHeight;
    state.imageObjectUrl = objectUrl;
    state.previewReady = true;
    preview.src = objectUrl;
    preview.hidden = false;
    placeholder.hidden = true;
    canvasLabel.hidden = true;
    changeButton.disabled = false;
    deleteButton.disabled = false;
    drawImageOnCanvas(image);
  }
  function loadImage(file) {
    if (!isAllowedImage(file)) { showError("지원하지 않는 이미지 형식입니다."); return; }
    if (file.size > MAX_FILE_SIZE) { showError("이미지는 최대 10MB까지 사용할 수 있습니다."); return; }
    const requestId = ++loadSequence;
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = function () {
      if (requestId !== loadSequence) { URL.revokeObjectURL(objectUrl); return; }
      clearError();
      showUploadedImage(image, objectUrl);
    };
    image.onerror = function () {
      URL.revokeObjectURL(objectUrl);
      if (requestId === loadSequence) showError("이미지를 불러올 수 없습니다.");
    };
    image.src = objectUrl;
  }
  function chooseImage() { input.click(); }
  function deleteImage() {
    loadSequence += 1;
    resetImageState();
    input.value = "";
    preview.removeAttribute("src");
    preview.hidden = true;
    placeholder.hidden = false;
    canvasLabel.hidden = false;
    changeButton.disabled = true;
    deleteButton.disabled = true;
    clearError();
    window.drawCanvasBackground();
  }

  uploadButton.addEventListener("click", chooseImage);
  changeButton.addEventListener("click", chooseImage);
  deleteButton.addEventListener("click", deleteImage);
  input.addEventListener("change", function () { const [file] = input.files; if (file) loadImage(file); input.value = ""; });
})();
