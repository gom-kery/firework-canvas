(function setupWebmRecording() {
  const RECORDING_FPS = 60;
  const RECORDING_TAIL_MS = 140;
  const MIME_TYPES = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"];
  const state = window.fireworkState;
  const canvas = window.fireworkCanvas;
  const saveButton = document.getElementById("saveButton");
  const previewButton = document.getElementById("previewButton");
  let recorder = null;
  let stream = null;
  let chunks = [];
  let stopTimer = null;
  let completionMessage = "";
  let finalized = false;
  const downloadUrls = new Set();

  function setStatus(message) { if (window.setPreviewStatus) window.setPreviewStatus(message); }
  function getRecorderOptions() {
    if (typeof window.MediaRecorder === "undefined" || typeof canvas.captureStream !== "function") return null;
    const mimeType = MIME_TYPES.find((candidate) => !MediaRecorder.isTypeSupported || MediaRecorder.isTypeSupported(candidate));
    return mimeType ? { mimeType } : {};
  }
  function setSaveButtonState(recording) {
    saveButton.disabled = recording || !getRecorderOptions();
    saveButton.textContent = recording ? "● Recording..." : "↓ Save Video";
  }
  function createFileName() {
    const now = new Date();
    const pad = (value) => String(value).padStart(2, "0");
    return `firework-canvas-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}.webm`;
  }
  function downloadBlob(blob) {
    const url = URL.createObjectURL(blob);
    downloadUrls.add(url);
    const link = document.createElement("a");
    link.href = url;
    link.download = createFileName();
    link.style.display = "none";
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => { URL.revokeObjectURL(url); downloadUrls.delete(url); }, 1000);
  }
  function releaseRecordingResources() {
    if (stopTimer !== null) { clearTimeout(stopTimer); stopTimer = null; }
    if (stream) stream.getTracks().forEach((track) => track.stop());
    stream = null; recorder = null; chunks = [];
    state.recording = false;
    setSaveButtonState(false);
    if (!state.playing) previewButton.disabled = false;
  }
  function finalizeRecording() {
    if (finalized) return;
    finalized = true;
    const blob = chunks.length ? new Blob(chunks, { type: recorder?.mimeType || "video/webm" }) : null;
    if (blob && blob.size > 0) {
      state.recordedBlob = blob;
      saveButton.textContent = "↓ Downloading...";
      try {
        downloadBlob(blob);
        setStatus("WebM 영상을 다운로드했습니다.");
      } catch (error) { setStatus("WebM 영상은 생성되었지만 다운로드를 시작할 수 없습니다."); }
    } else setStatus(completionMessage || "영상 기록에 실패했습니다.");
    releaseRecordingResources();
  }
  function stopRecording(message = "") {
    if (!recorder) return;
    completionMessage = message;
    if (stopTimer !== null) { clearTimeout(stopTimer); stopTimer = null; }
    if (recorder.state !== "inactive") recorder.stop();
    else finalizeRecording();
  }
  function scheduleRecordingStop() {
    stopTimer = window.setTimeout(() => stopRecording(), RECORDING_TAIL_MS);
  }
  function startRecording() {
    if (state.recording || state.playing) return;
    if (!state.image || !state.particles.length) { setStatus("먼저 이미지를 업로드해주세요."); return; }
    const options = getRecorderOptions();
    if (!options) { setStatus("이 브라우저에서는 WebM 기록을 지원하지 않습니다."); return; }
    state.recordedBlob = null;
    try {
      stream = canvas.captureStream(RECORDING_FPS);
      recorder = new MediaRecorder(stream, options);
    } catch (error) {
      if (stream) stream.getTracks().forEach((track) => track.stop());
      stream = null; recorder = null;
      setStatus("WebM 기록을 시작할 수 없습니다.");
      return;
    }
    chunks = [];
    finalized = false;
    recorder.ondataavailable = (event) => { if (event.data.size > 0) chunks.push(event.data); };
    recorder.onerror = () => stopRecording("영상 기록 중 오류가 발생했습니다.");
    recorder.onstop = finalizeRecording;
    state.recording = true;
    setSaveButtonState(true);
    setStatus("영상 기록 중입니다...");
    try { recorder.start(); } catch (error) { releaseRecordingResources(); setStatus("WebM 기록을 시작할 수 없습니다."); return; }
    const started = window.startFormationAnimation({ onComplete: scheduleRecordingStop, onInterrupted: () => stopRecording("영상 기록이 중단되었습니다.") });
    if (!started) stopRecording("영상 기록을 시작할 수 없습니다.");
  }

  if (!getRecorderOptions()) {
    saveButton.disabled = true;
    saveButton.title = "이 브라우저에서는 WebM 기록을 지원하지 않습니다.";
  }
  saveButton.addEventListener("click", startRecording);
  window.webmRecordingConfig = { RECORDING_FPS, RECORDING_TAIL_MS, MIME_TYPES, createFileName };
})();
