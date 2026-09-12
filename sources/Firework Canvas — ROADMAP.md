# Firework Canvas
## MVP ROADMAP

Version: 0.1

---

# Phase 0 — Foundation

## Unit 0.1 — Project Setup

목표:

Firework Canvas의 기본 프로젝트 구조와 화면을 만든다.

구현:

- index.html
- style.css
- JS 파일 구조
- Canvas 생성
- 기본 UI
- PROJECT_BIBLE 기준 구조 적용

완료 기준:

```text
페이지 실행
↓
Canvas 표시
↓
설정 UI 표시
```

아직 실제 불꽃은 구현하지 않는다.

---

## Unit 0.2 — Image Upload

목표:

사용자가 이미지를 업로드하고 Canvas에서 확인할 수 있게 한다.

구현:

- JPG
- JPEG
- PNG
- WebP
- 10MB 제한
- FileReader / Object URL
- Canvas 이미지 렌더링
- Aspect Ratio 처리
- 오류 메시지

완료 기준:

```text
Upload
↓
Canvas
↓
Image Preview
```

---

# Phase 1 — Image → Particles

## Unit 1.1 — Particle Sampling

목표:

이미지를 Particle 데이터로 변환한다.

구현:

- Canvas Pixel 읽기
- 일정 간격 샘플링
- 투명 영역 제외
- 위치 저장
- RGB 저장
- Particle 생성

Particle 기본 구조:

```js
{
  x,
  y,
  targetX,
  targetY,
  color,
  alpha
}
```

완료 기준:

업로드한 이미지를 **점 형태로 다시 그렸을 때 원본 형태를 알아볼 수 있어야 한다.**

---

## Unit 1.2 — Particle Quality

목표:

Particle 수와 이미지 품질 사이의 균형을 만든다.

구현:

```text
Low

Normal

High
```

Particle 수 설정에 따라 Sampling Density 변경.

확인 항목:

- Desktop FPS
- Mobile FPS
- 이미지 식별 가능성
- 메모리 사용

완료 기준:

세 가지 Particle 설정이 정상 작동한다.

---

# Phase 2 — Firework Animation

## Unit 2.1 — Formation Animation

목표:

Particle이 이미지 형태로 모이는 애니메이션을 만든다.

구현:

```text
Random / Center Position
↓
Target Position
↓
Image Formation
```

필요 요소:

- interpolation
- easing
- particle target
- animation state

완료 기준:

Particle들이 움직이면서 이미지 형태를 만든다.

---

## Unit 2.2 — Firework Launch & Burst

목표:

실제 불꽃처럼 보이기 위한 시작 연출을 추가한다.

구현:

```text
Rocket Launch
↓
Burst
↓
Particle Formation
```

포함:

- 하단 발사
- 상승 궤적
- 작은 Trail
- Burst Flash

완료 기준:

단순 이미지 등장 대신 **불꽃이 터진 결과가 이미지가 되는 느낌**이 나야 한다.

---

## Unit 2.3 — Scatter & Fade

목표:

이미지가 불꽃처럼 자연스럽게 사라지도록 만든다.

구현:

- velocity
- gravity
- friction
- randomness
- alpha fade
- particle life

동작:

```text
Image Formation
↓
Hold
↓
Scatter
↓
Fade
```

완료 기준:

하나의 Firework Animation Cycle이 완성된다.

---

# Phase 3 — Color

## Unit 3.1 — Original / Palette

목표:

첫 번째 색상 선택 기능을 구현한다.

Original:

```text
이미지 Pixel Color
→
Particle Color
```

Palette:

```text
Image
↓
Dominant Colors
↓
3~5 Color Palette
↓
Particles
```

완료 기준:

Original / Palette 전환 시 불꽃 색상이 즉시 변경된다.

---

## Unit 3.2 — Color Picker

목표:

사용자가 이미지에서 직접 색상을 선택할 수 있게 한다.

구현:

```text
Pick 선택
↓
Image 클릭
↓
Pixel RGB 획득
↓
Picked Color 표시
↓
Firework 적용
```

완료 기준:

사용자가 이미지의 원하는 색을 직접 선택할 수 있다.

---

# Phase 4 — Playback / UI

## Unit 4.1 — Duration & Ratio

목표:

출력 형태를 설정할 수 있게 한다.

Duration:

```text
3 sec
5 sec
```

Ratio:

```text
1:1

9:16
```

완료 기준:

설정을 변경해도 Particle 위치와 Canvas가 정상 재계산된다.

---

## Unit 4.2 — Preview Controller

목표:

완성된 불꽃을 반복해서 확인할 수 있게 한다.

구현:

```text
Preview

Replay

Playing State
```

필수 처리:

- 연속 클릭 방지
- Animation Reset
- Particle Reset
- 설정 변경 후 재생
- 반복 재생 안정성

완료 기준:

여러 번 Preview해도 동일하게 정상 동작한다.

---

# Phase 5 — Export

## Unit 5.1 — WebM Recording

목표:

Canvas 애니메이션을 영상 파일로 저장한다.

구현 후보:

```js
canvas.captureStream()

MediaRecorder
```

흐름:

```text
Preview Start
↓
Recording Start
↓
Animation End
↓
Recording Stop
↓
Blob
```

완료 기준:

3초 / 5초 영상이 정상적인 WebM 파일로 만들어진다.

---

## Unit 5.2 — Download

목표:

생성된 영상을 다운로드할 수 있게 한다.

구현:

- Blob URL
- 파일명
- Download
- Object URL 정리
- 연속 다운로드 테스트

파일명 예:

```text
firework-canvas-20260911.webm
```

완료 기준:

다운로드한 영상이 브라우저 밖에서도 정상 재생된다.

---

# Phase 6 — MVP Integration

## Unit 6.1 — Responsive UI

목표:

PC와 모바일에서 Firework Canvas를 사용할 수 있게 한다.

검증:

- Desktop
- Tablet
- Mobile
- 1:1 Canvas
- 9:16 Canvas

UI 원칙:

Canvas를 가장 크게 보여준다.

설정 영역은 가능한 한 압축한다.

---

## Unit 6.2 — Error / Performance Test

검증 대상:

### Image

- JPG
- PNG
- WebP
- 투명 PNG
- 작은 이미지
- 큰 이미지
- 10MB 초과

### Particle

- Low
- Normal
- High

### Animation

- 3 sec
- 5 sec
- 연속 Preview

### Ratio

- 1:1
- 9:16

### Export

- WebM 생성
- 반복 저장

### Browser

우선:

```text
Chrome Desktop

Chrome Android

Safari iPhone
```

Safari의 MediaRecorder / 영상 포맷 지원 여부는 실제 환경 테스트 결과에 따라 처리한다.

---

# Phase 7 — MVP Finish

## Unit 7.1 — Final Polish

목표:

기능 추가 없이 MVP 품질만 개선한다.

대상:

- Particle 움직임
- Glow
- Trail
- Burst timing
- Fade timing
- UI 간격
- 버튼 상태
- 오류 메시지

새로운 기능은 추가하지 않는다.

---

## Unit 7.2 — Documentation / Release

작성:

```text
README.md

PROJECT_BIBLE.md

ROADMAP.md

CHANGELOG.md
```

버전:

```text
Firework Canvas
v0.1.0
```

MVP 완료.

---

# Development Order

실제 개발 순서:

```text
0.1
↓
0.2

1.1
↓
1.2

2.1
↓
2.2
↓
2.3

3.1
↓
3.2

4.1
↓
4.2

5.1
↓
5.2

6.1
↓
6.2

7.1
↓
7.2
```

총:

**17 Units**

---

# Important Checkpoints

프로젝트에서 특히 중요한 Unit은 다음 네 개다.

## Checkpoint A

**Unit 1.1**

이미지가 Particle만으로도 알아볼 수 있는가?

---

## Checkpoint B

**Unit 2.3**

이미지 등장 효과가 아니라 실제 불꽃처럼 느껴지는가?

---

## Checkpoint C

**Unit 5.1**

브라우저에서 3~5초 결과물을 안정적으로 영상으로 만들 수 있는가?

---

## Checkpoint D

**Unit 6.2**

모바일에서도 사용할 수 있는 수준의 성능인가?

---

이 네 Checkpoint를 통과하면 Firework Canvas MVP의 핵심 기술 가능성이 검증된 것으로 본다.