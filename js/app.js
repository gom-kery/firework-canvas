const state = {
  image: null,
  imageWidth: 0,
  imageHeight: 0,
  colorMode: "original",
  pickedColor: null,
  particleMode: "normal",
  duration: 5,
  ratio: "1:1",
  particles: [],
  playing: false,
  recording: false
};

const canvas = document.getElementById("fireworkCanvas");
const context = canvas.getContext("2d");

function drawCanvasBase() {
  const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "#142456");
  gradient.addColorStop(1, "#03040b");
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);
}

function selectOption(button) {
  const { setting, value } = button.dataset;
  document.querySelectorAll(`[data-setting="${setting}"]`).forEach((option) => {
    option.classList.toggle("is-selected", option === button);
  });

  if (setting === "color") state.colorMode = value;
  if (setting === "particles") state.particleMode = value;
  if (setting === "duration") state.duration = Number(value);
  if (setting === "ratio") state.ratio = value;
}

document.querySelectorAll(".option-button").forEach((button) => {
  button.addEventListener("click", () => selectOption(button));
});

document.getElementById("uploadButton").addEventListener("click", () => {
  document.getElementById("imageInput").click();
});

drawCanvasBase();
