(function setupFireworkSequence() {
  const TIMING = { launch: 780, rocketStagger: 55, burst: 260, formation: 1000, hold: 700, scatter: 850, fade: 700 };
  const SCATTER = { spread: 44, speed: 1.65, randomness: 0.7, gravity: 0.035, friction: 0.982 };
  const PHASE = { IDLE: "IDLE", LAUNCH: "LAUNCH", BURST: "BURST", FORMATION: "FORMATION", HOLD: "HOLD", SCATTER: "SCATTER", FADE: "FADE", COMPLETE: "COMPLETE" };
  let sequenceFrameId = null;
  let particleFrameId = null;
  const state = window.fireworkState;
  const previewButton = document.getElementById("previewButton");
  const markerArea = document.getElementById("launchMarkerArea");
  const easeOutQuart = (progress) => 1 - Math.pow(1 - progress, 4);
  const easeInOutCubic = (progress) => progress < .5 ? 4 * progress ** 3 : 1 - ((-2 * progress + 2) ** 3) / 2;
  const getBurstPoint = () => ({ x: window.fireworkCanvas.width / 2, y: window.fireworkCanvas.height * .48 });
  const getLaunchPoints = (count) => Array.from({ length: count }, (_, index) => ({ x: window.fireworkCanvas.width * (index + 1) / (count + 1), y: window.fireworkCanvas.height - 14 }));

  function setPhase(phase) { state.phase = phase; }
  function renderLaunchMarkers() {
    markerArea.replaceChildren();
    const line = document.createElement("span"); line.className = "marker-line"; markerArea.append(line);
    for (const point of getLaunchPoints(state.launchPointCount)) {
      const marker = document.createElement("span"); marker.className = "launch-marker";
      marker.style.left = `${point.x / window.fireworkCanvas.width * 100}%`; markerArea.append(marker);
    }
  }
  const setMarkersVisible = (visible) => markerArea.classList.toggle("is-hidden", !visible);
  function renderParticles() {
    const context = window.fireworkContext;
    window.drawCanvasBackground(); context.save(); context.globalCompositeOperation = "lighter";
    for (const particle of state.particles) {
      context.fillStyle = particle.color; context.globalAlpha = particle.alpha;
      context.fillRect(particle.currentX, particle.currentY, 2, 2);
    }
    context.restore();
  }
  function renderRockets(rockets) {
    const context = window.fireworkContext;
    window.drawCanvasBackground(); context.save();
    for (const rocket of rockets) {
      const trailProgress = Math.max(0, rocket.progress - .13);
      const trailX = rocket.startX + (rocket.burstX - rocket.startX) * trailProgress;
      const trailY = rocket.startY + (rocket.burstY - rocket.startY) * trailProgress;
      const trail = context.createLinearGradient(trailX, trailY, rocket.x, rocket.y);
      trail.addColorStop(0, "rgba(184,151,255,0)"); trail.addColorStop(1, "rgba(229,217,255,.9)");
      context.strokeStyle = trail; context.lineWidth = 2; context.beginPath(); context.moveTo(trailX, trailY); context.lineTo(rocket.x, rocket.y); context.stroke();
      context.fillStyle = "#fff8d8"; context.shadowBlur = 16; context.shadowColor = "#c5aaff"; context.beginPath(); context.arc(rocket.x, rocket.y, 3.2, 0, Math.PI * 2); context.fill();
    }
    context.restore();
  }
  function renderBurst(point, progress) {
    const context = window.fireworkContext; const radius = 12 + progress * 52; const alpha = 1 - progress;
    window.drawCanvasBackground(); context.save();
    const glow = context.createRadialGradient(point.x, point.y, 0, point.x, point.y, radius);
    glow.addColorStop(0, `rgba(255,251,219,${alpha})`); glow.addColorStop(.35, `rgba(205,168,255,${alpha * .75})`); glow.addColorStop(1, "rgba(145,99,255,0)");
    context.fillStyle = glow; context.beginPath(); context.arc(point.x, point.y, radius, 0, Math.PI * 2); context.fill(); context.restore();
  }
  function prepareFormationParticles(origin) {
    for (const particle of state.particles) {
      const angle = Math.random() * Math.PI * 2; const distance = Math.sqrt(Math.random()) * SCATTER.spread;
      particle.baseAlpha = particle.baseAlpha ?? particle.alpha;
      particle.alpha = particle.baseAlpha; particle.vx = 0; particle.vy = 0;
      particle.startX = origin.x + Math.cos(angle) * distance; particle.startY = origin.y + Math.sin(angle) * distance;
      particle.currentX = particle.startX; particle.currentY = particle.startY; particle.x = particle.startX; particle.y = particle.startY; particle.progress = 0;
    }
  }
  function restoreParticleTargets() {
    for (const particle of state.particles) {
      particle.alpha = particle.baseAlpha ?? particle.alpha;
      particle.vx = 0; particle.vy = 0;
      particle.currentX = particle.targetX; particle.currentY = particle.targetY;
      particle.x = particle.targetX; particle.y = particle.targetY;
    }
  }
  function prepareScatterParticles(origin) {
    for (const particle of state.particles) {
      let dx = particle.targetX - origin.x; let dy = particle.targetY - origin.y;
      const length = Math.hypot(dx, dy) || 1;
      dx /= length; dy /= length;
      particle.vx = dx * SCATTER.speed + (Math.random() - .5) * SCATTER.randomness;
      particle.vy = dy * SCATTER.speed + (Math.random() - .5) * SCATTER.randomness;
      particle.alpha = particle.baseAlpha;
    }
  }
  function updateScatter(delta) {
    const frameScale = Math.min(delta / 16.67, 2.5);
    const friction = SCATTER.friction ** frameScale;
    for (const particle of state.particles) {
      particle.vy += SCATTER.gravity * frameScale;
      particle.vx *= friction; particle.vy *= friction;
      particle.currentX += particle.vx * frameScale; particle.currentY += particle.vy * frameScale;
      particle.x = particle.currentX; particle.y = particle.currentY;
    }
  }
  function finishSequence(showStatic) {
    state.playing = false; state.formationProgress = 0; sequenceFrameId = null; particleFrameId = null; previewButton.disabled = false;
    setPhase(PHASE.COMPLETE);
    if (showStatic) { restoreParticleTargets(); window.renderStaticParticles(state.particles); } else window.drawCanvasBackground();
    setMarkersVisible(true); setPhase(PHASE.IDLE);
  }
  function animateFade(startedAt, previousAt) {
    const now = performance.now(); const progress = Math.min((now - startedAt) / TIMING.fade, 1);
    updateScatter(now - previousAt);
    for (const particle of state.particles) particle.alpha = particle.baseAlpha * (1 - progress);
    renderParticles();
    if (progress < 1) { particleFrameId = requestAnimationFrame(() => animateFade(startedAt, now)); return; }
    finishSequence(false);
  }
  function animateScatter(startedAt, previousAt, origin) {
    const now = performance.now(); const progress = Math.min((now - startedAt) / TIMING.scatter, 1);
    updateScatter(now - previousAt); renderParticles();
    if (progress < 1) { particleFrameId = requestAnimationFrame(() => animateScatter(startedAt, now, origin)); return; }
    setPhase(PHASE.FADE); particleFrameId = requestAnimationFrame(() => animateFade(performance.now(), performance.now()));
  }
  function animateHold(startedAt, origin) {
    renderParticles();
    if (performance.now() - startedAt < TIMING.hold) { particleFrameId = requestAnimationFrame(() => animateHold(startedAt, origin)); return; }
    setPhase(PHASE.SCATTER); prepareScatterParticles(origin); particleFrameId = requestAnimationFrame(() => animateScatter(performance.now(), performance.now(), origin));
  }
  function animateFormation(startedAt, origin) {
    const progress = Math.min((performance.now() - startedAt) / TIMING.formation, 1); const eased = easeOutQuart(progress);
    for (const particle of state.particles) {
      particle.progress = progress; particle.currentX = particle.startX + (particle.targetX - particle.startX) * eased; particle.currentY = particle.startY + (particle.targetY - particle.startY) * eased; particle.x = particle.currentX; particle.y = particle.currentY;
    }
    state.formationProgress = progress; renderParticles();
    if (progress < 1) { particleFrameId = requestAnimationFrame(() => animateFormation(startedAt, origin)); return; }
    setPhase(PHASE.HOLD); particleFrameId = requestAnimationFrame(() => animateHold(performance.now(), origin));
  }
  function animateBurst(startedAt, point) {
    const progress = Math.min((performance.now() - startedAt) / TIMING.burst, 1); renderBurst(point, progress);
    if (progress < 1) { sequenceFrameId = requestAnimationFrame(() => animateBurst(startedAt, point)); return; }
    sequenceFrameId = null; setPhase(PHASE.FORMATION); prepareFormationParticles(point); renderParticles(); particleFrameId = requestAnimationFrame(() => animateFormation(performance.now(), point));
  }
  function animateLaunch(startedAt, rockets, burstPoint) {
    let allArrived = true;
    for (const rocket of rockets) {
      const local = Math.min(Math.max((performance.now() - startedAt - rocket.delay) / TIMING.launch, 0), 1);
      rocket.progress = easeInOutCubic(local); rocket.x = rocket.startX + (rocket.burstX - rocket.startX) * rocket.progress; rocket.y = rocket.startY + (rocket.burstY - rocket.startY) * rocket.progress;
      if (local < 1) allArrived = false;
    }
    renderRockets(rockets);
    if (!allArrived) { sequenceFrameId = requestAnimationFrame(() => animateLaunch(startedAt, rockets, burstPoint)); return; }
    setPhase(PHASE.BURST); sequenceFrameId = requestAnimationFrame(() => animateBurst(performance.now(), burstPoint));
  }
  window.stopFireworkSequence = () => { if (sequenceFrameId !== null) cancelAnimationFrame(sequenceFrameId); if (particleFrameId !== null) cancelAnimationFrame(particleFrameId); finishSequence(true); };
  window.stopFormationAnimation = window.stopFireworkSequence;
  function startFireworkSequence() {
    if (!state.particles.length) return;
    if (state.playing) window.stopFireworkSequence();
    const burstPoint = getBurstPoint();
    const rockets = getLaunchPoints(state.launchPointCount).map((point, index) => ({ startX: point.x, startY: point.y, x: point.x, y: point.y, burstX: burstPoint.x, burstY: burstPoint.y, progress: 0, delay: index * TIMING.rocketStagger }));
    state.playing = true; setPhase(PHASE.LAUNCH); previewButton.disabled = true; setMarkersVisible(false); renderRockets(rockets); sequenceFrameId = requestAnimationFrame(() => animateLaunch(performance.now(), rockets, burstPoint));
  }
  document.querySelectorAll("[data-launch-count]").forEach((button) => button.addEventListener("click", () => { if (state.playing) return; state.launchPointCount = Number(button.dataset.launchCount); document.querySelectorAll("[data-launch-count]").forEach((item) => item.classList.toggle("is-selected", item === button)); renderLaunchMarkers(); }));
  previewButton.addEventListener("click", startFireworkSequence);
  window.startFormationAnimation = startFireworkSequence;
  window.fireworkAnimationConfig = { TIMING, SCATTER, PHASE };
  renderLaunchMarkers();
})();
