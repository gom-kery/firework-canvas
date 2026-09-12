# Firework Canvas
## PROJECT_BIBLE

Version: 0.1  
Status: MVP Planning

---

# 1. Project Overview

## 1.1 프로젝트명

**Firework Canvas**

## 1.2 한 줄 정의

사용자가 업로드한 이미지의 **형태와 색상 데이터를 불꽃 입자로 변환하여 짧은 불꽃 애니메이션으로 재생하고 저장할 수 있는 웹 애플리케이션**.

## 1.3 핵심 경험

> 이미지 한 장을 올리면, 그 이미지가 밤하늘의 불꽃으로 변한다.

사용 과정은 최대한 단순하게 유지한다.

```text
이미지 업로드
    ↓
불꽃 변환
    ↓
색상 / 입자 설정
    ↓
미리보기
    ↓
영상 저장
```

---

# 2. MVP Goal

MVP의 목표는 다음 한 가지 경험을 안정적으로 구현하는 것이다.

> **이미지 1장 → 이미지 형태의 불꽃 → 최대 5초 애니메이션 → 파일 저장**

이미지 생성 AI는 사용하지 않는다.

이미지 분석과 애니메이션은 가능한 한 브라우저 내부에서 처리한다.

---

# 3. MVP Scope

## 3.1 이미지 업로드

지원 형식:

- JPG
- JPEG
- PNG
- WebP

최대 파일 크기:

- 10MB

이미지는 서버에 저장하지 않는다.

브라우저에서 File API와 Canvas를 이용해 처리한다.

---

# 4. Image Processing

업로드된 이미지는 Canvas에 그린 뒤 불꽃 생성용 데이터로 변환한다.

각 입자는 기본적으로 다음 값을 가진다.

```js
{
  x,
  y,
  targetX,
  targetY,

  color,

  vx,
  vy,

  alpha,
  size,
  life
}
```

모든 이미지 픽셀을 입자로 변환하지 않는다.

이미지를 일정 간격으로 샘플링하여 성능을 유지한다.

예상 Particle 프리셋:

```text
Low
약 2,000개

Normal
약 5,000개

High
약 8,000~10,000개
```

실제 값은 성능 테스트 후 조정한다.

---

# 5. Firework Animation

MVP의 기본 불꽃 애니메이션은 하나의 연출만 구현한다.

```text
Launch
↓
Burst
↓
Image Formation
↓
Hold
↓
Scatter
↓
Fade
```

## 5.1 Launch

화면 아래에서 하나의 빛이 상승한다.

## 5.2 Burst

목표 위치에서 작은 폭발이 발생한다.

## 5.3 Image Formation

입자들이 이미지에서 샘플링한 위치로 이동한다.

이 순간 원본 이미지의 형태가 불꽃 입자로 나타난다.

## 5.4 Hold

약 0.5~1초 동안 형태를 알아볼 수 있도록 유지한다.

## 5.5 Scatter

각 입자에 속도를 부여해 바깥 방향으로 흩어진다.

적용 가능한 값:

```text
velocity
gravity
friction
randomness
```

## 5.6 Fade

입자의 alpha를 감소시켜 자연스럽게 사라지게 한다.

---

# 6. Firework Rendering

렌더링은 HTML `<canvas>`를 사용한다.

기본 구조:

```text
Main Canvas
│
├─ Background
├─ Rocket
├─ Burst
├─ Image Particles
├─ Glow
└─ Trails
```

애니메이션 루프는 다음을 사용한다.

```js
requestAnimationFrame()
```

---

# 7. Color System

MVP에서는 세 가지 색상 모드를 제공한다.

## Original

업로드 이미지의 실제 픽셀 색상을 입자에 사용한다.

```text
Image Pixel
↓
RGB
↓
Particle Color
```

## Palette

이미지에서 대표적인 색상을 추출하여 제한된 색상 팔레트로 불꽃을 구성한다.

초기 목표:

```text
3~5 colors
```

## Picker

사용자가 이미지에서 원하는 위치를 클릭하여 색상을 선택한다.

Canvas의 픽셀 데이터를 이용한다.

예:

```js
ctx.getImageData(x, y, 1, 1)
```

선택한 색상은 불꽃의 강조색으로 사용한다.

MVP에서는 단일 Picker Color를 우선 지원한다.

---

# 8. Canvas Ratio

두 가지 출력 비율을 지원한다.

```text
1:1
1080 × 1080 기준

9:16
1080 × 1920 기준
```

실제 내부 렌더링 해상도는 기기 성능에 따라 축소할 수 있다.

---

# 9. Animation Duration

MVP에서는 두 가지 길이만 지원한다.

```text
3 seconds

5 seconds
```

사용자가 자유롭게 시간을 입력하는 기능은 MVP에서 제외한다.

---

# 10. Background

MVP의 기본 배경은 밤하늘 형태의 어두운 단색 또는 Gradient로 제한한다.

예:

```text
Dark Navy
↓
Black
```

사용자 배경 이미지 기능은 MVP 이후로 미룬다.

---

# 11. Controls

사용자가 조절할 수 있는 항목은 최소화한다.

```text
Image

Color
Original / Palette / Picker

Particles
Low / Normal / High

Duration
3s / 5s

Ratio
1:1 / 9:16
```

---

# 12. Preview

`Preview` 버튼을 누르면 애니메이션을 처음부터 재생한다.

재생 완료 후 다시 Preview할 수 있다.

Preview 중 설정을 변경하면 다음 Preview부터 적용한다.

---

# 13. Export

MVP에서는 Canvas 결과를 영상으로 저장한다.

우선 목표:

**WebM**

구현 후보:

```js
canvas.captureStream()
MediaRecorder
```

기본 흐름:

```text
Canvas
↓
captureStream
↓
MediaRecorder
↓
Blob
↓
Download
```

파일명 예:

```text
firework-canvas-20260911.webm
```

GIF는 다음 이유로 MVP에서 제외한다.

- 색상 제한
- 큰 파일 크기
- 변환 비용
- 브라우저 구현 복잡도

MP4 역시 브라우저 호환성 확인 후 후속 개발에서 검토한다.

---

# 14. UI Structure

Desktop / Mobile 모두 같은 기본 구조를 사용한다.

```text
┌────────────────────────────┐
│ Firework Canvas            │
│                            │
│ ┌────────────────────────┐ │
│ │                        │ │
│ │       Canvas           │ │
│ │                        │ │
│ └────────────────────────┘ │
│                            │
│ Image        [Upload]      │
│                            │
│ Color                      │
│ [Original][Palette][Pick]  │
│                            │
│ Particles                  │
│ [Low][Normal][High]        │
│                            │
│ Duration     [3s] [5s]     │
│ Ratio        [1:1][9:16]   │
│                            │
│       [ ▶ Preview ]        │
│                            │
│       [ ↓ Save ]           │
└────────────────────────────┘
```

설정창이나 별도 팝업은 만들지 않는다.

가능한 기능을 한 화면에 유지한다.

---

# 15. UI Principles

Firework Canvas UI는 다음 원칙을 따른다.

- 작은 기능 수
- 최소 클릭
- 즉각적인 결과 확인
- Canvas 중심 화면
- 불필요한 설명 최소화
- 모바일에서도 동일한 흐름
- 설정 팝업 최소화

메인 콘텐츠는 항상 Firework Canvas가 된다.

---

# 16. Privacy

MVP에서는 이미지가 외부 서버로 전송되지 않는 구조를 우선한다.

가능하면 모든 처리를 다음에서 수행한다.

```text
Browser
├─ File API
├─ Canvas
├─ JavaScript
└─ MediaRecorder
```

페이지를 종료하면 이미지와 작업 데이터는 제거된다.

---

# 17. Error Handling

다음 상황을 처리한다.

### 잘못된 파일 형식

```text
지원하지 않는 이미지 형식입니다.
```

### 파일 용량 초과

```text
이미지는 최대 10MB까지 사용할 수 있습니다.
```

### 이미지 로딩 실패

```text
이미지를 불러올 수 없습니다.
```

### 영상 저장 미지원 브라우저

지원 가능한 포맷을 확인하고 저장 기능을 비활성화하거나 안내한다.

---

# 18. Performance

Firework Canvas에서 가장 중요한 기술적 위험 요소는 Particle 수다.

다음 항목을 반드시 확인한다.

```text
Desktop

Mobile

Retina / High DPI

Particle 2,000

Particle 5,000

Particle 10,000
```

프레임 드롭이 심한 경우 자동으로 Particle 수를 줄이는 방식도 후속 검토한다.

MVP 목표:

```text
약 30 FPS 이상
```

가능하면 60 FPS를 목표로 한다.

---

# 19. Project Structure

초기 구조:

```text
firework-canvas/

├─ index.html
├─ css/
│  └─ style.css
│
├─ js/
│  ├─ app.js
│  ├─ image.js
│  ├─ particles.js
│  ├─ fireworks.js
│  └─ exporter.js
│
├─ assets/
│
├─ PROJECT_BIBLE.md
├─ ROADMAP.md
└─ README.md
```

처음부터 불필요한 프레임워크는 사용하지 않는다.

MVP 기본 기술:

```text
HTML
CSS
Vanilla JavaScript
Canvas API
MediaRecorder API
```

---

# 20. State

MVP에서는 복잡한 상태 관리 라이브러리를 사용하지 않는다.

예상 상태:

```js
state = {

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
}
```

---

# 21. MVP Exclusions

다음 기능은 0.1 MVP에 포함하지 않는다.

- 로그인
- 회원가입
- 서버
- Cloud Storage
- AI 이미지 생성
- 텍스트 → 이미지
- 여러 이미지 연속 재생
- Firework Show
- 배경 이미지 업로드
- 음악
- 효과음
- MP4 변환 서버
- SNS 공유
- 프로젝트 저장
- 타임라인 편집
- 여러 불꽃 Effect
- 10초 이상 영상
- 고급 Particle Editor

---

# 22. Future Ideas

MVP 이후 검토 가능한 기능.

## Firework Show

여러 이미지를 순서대로 불꽃으로 재생.

```text
Image 1
↓
Image 2
↓
Image 3
```

## Text Fireworks

사용자가 작성한 텍스트를 불꽃으로 변환.

```text
LOVE

2027

HAPPY BIRTHDAY
```

## Custom Background

사용자가 야경 사진을 업로드하고 그 위에 불꽃 표시.

## Multiple Fireworks

한 장면에서 여러 불꽃을 동시에 실행.

## Firework Style

예:

```text
Classic

Spark

Willow

Ring

Explosion
```

## Sound

불꽃 발사 / 폭발 효과음.

## MP4

서버 또는 WebCodecs 기반 MP4 지원 검토.

---

# 23. MVP Success Criteria

MVP는 다음 조건을 만족하면 완료로 판단한다.

### 기능

- 이미지 업로드 가능
- 이미지가 Particle 데이터로 변환됨
- 이미지 형태를 알아볼 수 있음
- 불꽃 발사 애니메이션 존재
- 이미지 형태 생성
- Particle Scatter 존재
- Fade 존재
- Original Color 지원
- Palette Color 지원
- Picker Color 지원
- 3초 / 5초 지원
- 1:1 / 9:16 지원
- Particle 3단계 지원
- Preview 정상 작동
- WebM 다운로드 가능

### 품질

- 주요 브라우저에서 치명적인 오류 없음
- 일반적인 스마트폰에서 Preview 가능
- 반복 Preview 시 메모리 누수 없음
- 다운로드한 영상 정상 재생
- 원본 이미지가 서버로 전송되지 않음

---

# 24. Development Principle

Firework Canvas는 Unit 단위로 개발한다.

한 번에 전체 기능을 구현하지 않는다.

각 Unit은 다음 원칙을 따른다.

```text
구현
↓
독립 테스트
↓
문제 수정
↓
Unit 완료
↓
다음 Unit
```

Unit 범위 밖의 기능을 미리 구현하지 않는다.

MVP에서는 기술적으로 화려한 기능보다

**이미지가 불꽃으로 변하는 순간의 완성도**

를 가장 중요하게 본다.