# Firework Canvas Roadmap

## MVP v0.1.0

### Phase 0 — Foundation

| Unit | 상태 | 비고 |
| --- | --- | --- |
| 0.1 — Project Setup | 완료 | 기본 UI Shell |
| 0.2 — Image Upload | 완료 | Upload, Preview, Change, Delete |

### Phase 1 — Particle

| Unit | 상태 | 비고 |
| --- | --- | --- |
| 1.1 — Particle Sampling | 완료 | Checkpoint A 통과 |
| 1.2 — Particle Quality | 완료 | Preset 반복 변경 및 High 처리 확인 |

### Phase 2 — Animation

| Unit | 상태 | 비고 |
| --- | --- | --- |
| 2.1 — Formation Animation | 완료 | 중앙 Burst 시작점 기반 Formation Animation |
| 2.2 — Firework Launch & Burst | 완료 | Launch Point, Rocket, 공통 Burst |
| 2.3 — Scatter & Fade | 완료 | Hold, Scatter, Fade |

### Phase 3 — Color

| Unit | 상태 | 비고 |
| --- | --- | --- |
| 3.1 — Original / Palette | 완료 | Original RGB 및 Palette Mode |
| 3.2 — Color Picker | 완료 | Preview Pixel Pick 및 강조색 |

### Phase 4 — Playback

| Unit | 상태 | 비고 |
| --- | --- | --- |
| 4.1 — Duration & Ratio | 완료 | 3s / 5s 및 1:1 / 3:4 / 4:3 |
| 4.2 — Preview Controller | 완료 | 반복 재생, Reset, 상태 안내 |

### Phase 5 — Export

| Unit | 상태 | 비고 |
| --- | --- | --- |
| 5.1 — WebM Recording | 완료 | Canvas Capture 및 WebM Blob 기록 |
| 5.1A — Background Selection | 완료 | Default, Solid Color, Image Background |
| 5.2 — Video Download | 완료 | WebM Object URL 및 브라우저 다운로드 |

### Phase 6 — MVP Completion

| Unit | 상태 | 비고 |
| --- | --- | --- |
| 6.1 — Responsive UI | 완료 | Desktop, Tablet, Mobile Layout |
| 6.2 — Error / Performance Test | 검증 대기 | 통합 오류·반복 실행·성능 점검 |
| 6.3 — Final Polish | 대기 | 시각 완성도·사용성·Regression 점검 |
| 6.4 — Documentation / Release | 대기 | v0.1.0 문서·버전·Release 정리 |

**MVP 완료 조건:** Unit 6.2 검증, Unit 6.3 Final Polish, Unit 6.4 Documentation / Release를 모두 완료하면 Firework Canvas v0.1.0을 Release합니다.

## Included refinements

### Unit 4.1A — Image Framing & Pacing — 완료

- 이미지 원형 Crop 및 선택 영역 Crop을 추가하고, Crop 영역 안에서 확대·이동할 수 있게 합니다.
- Framing 변경 시 Image Preview, Particle target, Color Picker, Firework Animation 데이터를 안전하게 다시 계산합니다.
- 3초 Timeline의 Launch / Formation / Hold / Fade 비율을 조정해 이미지 인식 시간을 확보합니다.
- 출력 Ratio를 1:1 / 3:4 / 4:3으로 변경하고 기존 9:16은 제거합니다.

### Unit 4.1B — Upload Image UI Refinement — 완료

- 업로드 패널의 큰 초기 안내를 제거하고, 지원 형식·용량 안내만 표시합니다.
- 하나의 동작 버튼은 이미지가 없을 때 Upload, 이미지가 있을 때 Change로 표시합니다.
- Delete와 편집 미리보기, Image Framing 컨트롤의 순서를 정리합니다.

### Unit 4.1C — Firework Composition — 완료

- Convert Canvas 안에서 최종 이미지 불꽃의 크기와 표시 위치를 조정하는 컨트롤을 추가합니다.
- Composition 변경 시 Particle target, Burst 위치, Formation 및 Scatter의 기준점을 함께 다시 계산합니다.

### Unit 6.1 — Responsive UI additions — 완료

- Upload 버튼을 Change / Delete Action 영역에 통합합니다. 이미지가 없을 때는 Upload, 이미지가 있으면 Change를 표시합니다.
- 업로드 영역 안내 문구는 지원 형식과 최대 용량만 남깁니다.
- 세로 Ratio에서도 Preview / Save Video 버튼이 화면 하단에서 안정적으로 접근 가능하도록 배치합니다.

### Unit 6.3 — Final Polish — 대기

- Animation, UI, Color의 작은 시각·사용성 보완과 Regression Test만 수행합니다.
- 새로운 Animation Style, Sound, MP4, Backend, Multiple Images, Timeline Editor는 추가하지 않습니다.

### Unit 6.4 — Documentation / Release — 대기

- README, PROJECT_BIBLE, ROADMAP, CHANGELOG를 실제 구현과 v0.1.0 기준으로 정리합니다.
- Release 직전 코드 경로, 불필요한 Debug·Test UI, 최종 사용자 흐름을 점검합니다.

## MVP decisions

- MVP 출력 Ratio는 1:1 / 3:4 / 4:3입니다. 기존 9:16은 지원하지 않습니다.
- 이 결정은 다음 PROJECT_BIBLE 기준 문서 동기화 시 출력 Ratio 기준에도 반영합니다.

## v0.2+ Future Expansion

### Unit 7.1 — Launch Point Editor & Rocket Controls — 대기

- Launch Point를 하단 고정 배치 외에 Canvas 테두리 전체로 이동할 수 있게 합니다.
- Canvas 가장자리에서 절반·1/4만 보이는 배치도 허용합니다.
- Rocket 상승 속도(느림~빠름), Trail 굵기, Launch Point 위치를 개별 또는 공통 설정으로 관리합니다.

### Unit 7.2 — Standard Firework Mode — 대기

- 이미지를 사용하지 않는 일반 불꽃 모드를 추가합니다.
- Image Firework와 Standard Firework는 같은 Preview·Recording·Download 흐름을 재사용합니다.

### Unit 7.3 — Firework Styles — 대기

- 타상불꽃 스타일의 Burst와 꼬리 효과 on/off를 구현합니다.
- 장치불꽃 스타일을 별도 패턴과 발사 위치 규칙으로 구현합니다.
- 스타일별 고급 물리·색상 Preset은 이 Unit의 시각 검증 뒤에만 확장합니다.

### Unit 7.4 — Sequential Image Fireworks — 대기

- 한 장의 이미지를 동일 또는 서로 다른 위치에서 N회 순차 Burst할 수 있게 합니다.
- Burst 수, 순차 간격, 각 Burst 위치를 관리하며 Recording Timeline에 포함합니다.

### Unit 7.5 — Multiple Image Project — 대기

- 여러 이미지를 한 프로젝트에서 관리하고, 이미지별 Firework와 순서를 구성합니다.
- 이미지별 Particle·Color·Burst·Timeline 상태를 분리합니다.
