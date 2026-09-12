# Changelog

## Unreleased

### Unit 2.3 — Scatter & Fade

- Launch부터 Fade까지의 Animation Phase를 명시적으로 관리합니다.
- Formation 뒤 700ms Hold를 추가했습니다.
- Burst 중심을 기준으로 바깥 방향 Velocity를 계산해 Scatter를 구현했습니다.
- Gravity, Friction, Randomness를 상수로 분리하고 Fade 중에도 Particle 이동을 유지합니다.
- Fade 종료 시 Canvas를 비우고 Marker를 복원하며, 다음 실행에서는 Particle 상태를 초기화합니다.

### Unit 2.2 — Firework Launch & Burst

- Launch Points 1~5 선택과 하단 균등 Marker 배치를 구현했습니다.
- 각 Point에서 Rocket이 소폭의 시간차를 두고 출발해 공통 Burst Point로 이동합니다.
- Rocket Head, 짧은 Trail, Burst Flash를 추가했습니다.
- Burst 완료 후 기존 Formation Animation을 같은 Burst Point에서 시작하도록 연결했습니다.
- 재생 중 Marker를 숨기고 종료·중단 후 다시 표시합니다.

### Unit 2.1 — Formation Animation

- Preview 버튼을 Unit 2.1의 임시 Formation 실행 트리거로 연결했습니다.
- Particle을 Canvas 중앙 주변의 무작위 시작 위치에서 target 위치로 이동시킵니다.
- `requestAnimationFrame`, 경과 시간, ease-out quart 보간을 사용해 1초 Formation을 구현했습니다.
- 재실행, 이미지 교체, 삭제, Particle Preset 변경 시 실행 중인 Animation Frame을 안전하게 정리합니다.

### Unit 1.2 — Particle Quality

- Low(약 2,000), Normal(약 5,000), High(약 9,000) Particle 상한 프리셋을 추가했습니다.
- 프리셋별 Sampling step을 이미지 처리 영역과 Particle 상한값으로 계산합니다.
- 프리셋 변경 시 기존 이미지를 유지하고 Particle을 재생성해 정적 렌더링을 즉시 갱신합니다.
- Particle 생성 시간을 상태에 기록해 이후 성능 확인에 활용할 수 있도록 했습니다.

### Unit 1.1 — Particle Sampling

- 오프스크린 Canvas에서 이미지 Pixel 데이터를 읽어 Particle Array로 변환했습니다.
- 투명 Pixel을 제외하는 `ALPHA_THRESHOLD = 32`를 정의했습니다.
- Canvas Fit 영역과 이미지 크기에 따라 샘플링 간격을 조절해 최대 약 7,000개로 제한했습니다.
- Original RGB 색상과 target 위치를 유지해 Static Particle Render로 원본 형태를 확인할 수 있게 했습니다.

### Unit 0.2 — Image Upload

- JPG, JPEG, PNG, WebP 이미지 업로드와 10MB 제한을 추가했습니다.
- 업로드한 원본 이미지를 비율 유지 상태로 Preview에 표시합니다.
- Change와 Delete 흐름, 이미지 상태 초기화, Object URL 해제를 구현했습니다.
- 유효하지 않은 파일, 용량 초과, 이미지 Decode 실패 오류를 표시합니다.
- Particle 및 불꽃 애니메이션 기능은 구현하지 않았습니다.
