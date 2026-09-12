window.fireworkState = {
  image: null,
  imageWidth: 0,
  imageHeight: 0,
  imageObjectUrl: null,
  particles: [],
  pickedColor: null,
  particleMode: "normal",
  particleBuildMs: 0,
  formationProgress: 0,
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
