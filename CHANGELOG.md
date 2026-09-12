# Changelog

## Unreleased

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
