(function setupBackgroundSelection() {
  const MAX_FILE_SIZE = 10 * 1024 * 1024;
  const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
  const ALLOWED_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp"]);
  const state = window.fireworkState;
  const input = document.getElementById("backgroundInput");
  const colorInput = document.getElementById("backgroundColor");
  const colorControl = document.getElementById("backgroundColorControl");
  const imageActions = document.getElementById("backgroundImageActions");
  const uploadButton = document.getElementById("backgroundUploadButton");
  const deleteButton = document.getElementById("backgroundDeleteButton");
  const errorMessage = document.getElementById("backgroundError");
  let loadSequence = 0;

  function showError(message) { errorMessage.textContent = message; errorMessage.hidden = false; }
  function clearError() { errorMessage.textContent = ""; errorMessage.hidden = true; }
  function isEditable() { return !state.playing && !state.recording; }
  function isAllowedImage(file) {
    const extension = file.name.split(".").pop().toLowerCase();
    return ALLOWED_TYPES.has(file.type) || ALLOWED_EXTENSIONS.has(extension);
  }
  function refreshCanvas() {
    if (state.particles.length) window.renderStaticParticles(state.particles);
    else window.drawCanvasBackground();
  }
  function updateControls() {
    const mode = state.background.mode;
    document.querySelectorAll("[data-background-mode]").forEach((button) => button.classList.toggle("is-selected", button.dataset.backgroundMode === mode));
    colorControl.hidden = mode !== "solid";
    imageActions.hidden = mode !== "image";
    uploadButton.textContent = state.background.image ? "Change Background" : "Choose Background";
    deleteButton.disabled = !state.background.image;
    colorInput.value = state.background.color;
  }
  function setMode(mode) {
    if (!isEditable()) { showError("Animation 또는 영상 기록이 끝난 뒤 배경을 변경할 수 있습니다."); return; }
    state.background.mode = mode;
    clearError(); updateControls(); refreshCanvas();
  }
  function replaceBackgroundImage(image, objectUrl) {
    if (state.background.imageObjectUrl) URL.revokeObjectURL(state.background.imageObjectUrl);
    state.background.image = image;
    state.background.imageObjectUrl = objectUrl;
    state.background.mode = "image";
    clearError(); updateControls(); refreshCanvas();
  }
  function loadBackgroundImage(file) {
    if (!isAllowedImage(file)) { showError("지원하지 않는 배경 이미지 형식입니다."); return; }
    if (file.size > MAX_FILE_SIZE) { showError("배경 이미지는 최대 10MB까지 사용할 수 있습니다."); return; }
    const requestId = ++loadSequence;
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      if (requestId !== loadSequence) { URL.revokeObjectURL(objectUrl); return; }
      replaceBackgroundImage(image, objectUrl);
    };
    image.onerror = () => { URL.revokeObjectURL(objectUrl); if (requestId === loadSequence) showError("배경 이미지를 불러올 수 없습니다."); };
    image.src = objectUrl;
  }
  function removeBackgroundImage() {
    if (!isEditable()) { showError("Animation 또는 영상 기록이 끝난 뒤 배경을 변경할 수 있습니다."); return; }
    loadSequence += 1;
    if (state.background.imageObjectUrl) URL.revokeObjectURL(state.background.imageObjectUrl);
    state.background.image = null;
    state.background.imageObjectUrl = null;
    state.background.mode = "default";
    clearError(); updateControls(); refreshCanvas();
  }

  document.querySelectorAll("[data-background-mode]").forEach((button) => button.addEventListener("click", () => setMode(button.dataset.backgroundMode)));
  colorInput.addEventListener("input", () => {
    if (!isEditable()) { colorInput.value = state.background.color; showError("Animation 또는 영상 기록이 끝난 뒤 배경을 변경할 수 있습니다."); return; }
    state.background.color = colorInput.value;
    if (state.background.mode === "solid") refreshCanvas();
  });
  uploadButton.addEventListener("click", () => { if (isEditable()) input.click(); else showError("Animation 또는 영상 기록이 끝난 뒤 배경을 변경할 수 있습니다."); });
  deleteButton.addEventListener("click", removeBackgroundImage);
  input.addEventListener("change", () => { const [file] = input.files; if (file) loadBackgroundImage(file); input.value = ""; });
  updateControls();
})();
