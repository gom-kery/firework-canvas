# Firework Canvas — MVP Roadmap Status

원본 PROJECT_BIBLE 및 ROADMAP은 작업 환경 복원 시 `sources/`에 다시 제공되어야 합니다.

| Unit | 상태 | 비고 |
| --- | --- | --- |
| 0.1 — Project Setup | 완료 | 기본 UI Shell |
| 0.2 — Image Upload | 완료 | Upload, Preview, Change, Delete |
| 1.1 — Particle Sampling | 완료 | Checkpoint A 통과 |
| 1.2 — Particle Quality | 완료 | Preset 반복 변경 및 High 처리 확인 |
| 2.1 — Formation Animation | 완료 | 중앙 Burst 시작점 기반 Formation Animation 및 반복 재생 확인 |
| 2.2 — Firework Launch & Burst | 완료 | 1~5 Launch Point, Rocket, 공통 Burst, Formation 연결 검증 완료 |
| 2.3 — Scatter & Fade | 완료 | Hold, 방향성 Scatter, Gravity, Friction, Fade 검증 완료 |
| 3.1 — Original / Palette | 완료 | Original RGB 및 Quantization Palette 색상 모드 검증 완료 |
| 3.2 — Color Picker | 완료 | Preview 좌표 변환, Pixel Pick, 강조색 Blend 검증 완료 |
| 4.1 — Duration & Ratio | 완료 | Timeline Scale 및 1:1 / 9:16 Canvas 재계산 검증 완료 |
| 4.2 — Preview Controller | 대기 | 진행하지 않음 |

## Planned refinements

### Unit 4.1A — Image Framing & Pacing — 검증 대기

- 이미지 원형 Crop 및 선택 영역 Crop을 추가하고, Crop 영역 안에서 확대·이동할 수 있게 합니다.
- Framing 변경 시 Image Preview, Particle target, Color Picker, Firework Animation 데이터를 안전하게 다시 계산합니다.
- 3초 Timeline의 Launch / Formation / Hold / Fade 비율을 조정해 이미지 인식 시간을 확보합니다.
- 출력 Ratio를 1:1 / 3:4 / 4:3으로 변경하고 기존 9:16은 제거합니다.

### Unit 4.1B — Upload Image UI Refinement — 검증 대기

- 업로드 패널의 큰 초기 안내를 제거하고, 지원 형식·용량 안내만 표시합니다.
- 하나의 동작 버튼은 이미지가 없을 때 Upload, 이미지가 있을 때 Change로 표시합니다.
- Delete와 편집 미리보기, Image Framing 컨트롤의 순서를 정리합니다.

### Unit 4.1C — Firework Composition — 대기

- Convert Canvas 안에서 최종 이미지 불꽃의 크기와 표시 위치를 조정하는 컨트롤을 추가합니다.
- Composition 변경 시 Particle target, Burst 위치, Formation 및 Scatter의 기준점을 함께 다시 계산합니다.

### Unit 6.1 — Responsive UI additions

- Upload 버튼을 Change / Delete Action 영역에 통합합니다. 이미지가 없을 때는 Upload, 이미지가 있으면 Change를 표시합니다.
- 업로드 영역 안내 문구는 지원 형식과 최대 용량만 남깁니다.
- 세로 Ratio에서도 Preview / Save Video 버튼이 화면 하단에서 안정적으로 접근 가능하도록 배치합니다.

### Confirmed design decision — Ratio

- MVP 출력 Ratio는 1:1 / 3:4 / 4:3입니다. 기존 9:16은 지원하지 않습니다.
- 이 결정은 다음 PROJECT_BIBLE 기준 문서 동기화 시 출력 Ratio 기준에도 반영합니다.
