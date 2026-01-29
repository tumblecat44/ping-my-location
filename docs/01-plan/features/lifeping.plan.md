# LifePing - Plan Document

> 위치 자동 수집 앱 for AI Native Life

## 1. 개요

### 1.1 프로젝트 명
**LifePing** - 위치를 주기적으로 ping해서 Claude Code가 읽을 수 있게 저장하는 앱

### 1.2 목적
- AI Native Life를 위한 위치 데이터 자동 수집
- 수동 기록 없이 "오늘 어디 갔어?"에 답할 수 있게
- 오픈소스로 공개하여 커뮤니티 기여

### 1.3 대상 사용자
- AI Native Life를 살고 싶은 사람
- Quantified Self / Lifelogging에 관심 있는 사람
- Claude Code 또는 LLM을 외장뇌로 쓰고 싶은 사람

---

## 2. 문제 정의

### 2.1 현재 상황
- 위치 기록을 남기려면 수동으로 해야 함
- 기존 앱들 (OwnTracks 등)은 MQTT 서버 필요, 설정 복잡
- Claude Code와 직접 연동되는 솔루션 없음

### 2.2 해결하고 싶은 것
| 문제 | 해결 |
|------|------|
| 위치 기록 귀찮음 | 자동 수집 (백그라운드) |
| 서버 운영 부담 | 서버리스 (텔레그램/Syncthing) |
| Claude Code 연동 어려움 | JSONL 형식으로 바로 읽기 |
| 기존 앱 복잡함 | 설정 최소화 (URL만 입력) |

---

## 3. 요구사항

### 3.1 기능 요구사항 (Functional)

| ID | 기능 | 우선순위 | 설명 |
|----|------|---------|------|
| F01 | 백그라운드 위치 수집 | P0 | 앱 꺼져도 주기적으로 위치 수집 |
| F02 | 주기 설정 | P0 | 15분/30분/1시간 등 선택 |
| F03 | HTTP POST 전송 | P0 | 설정한 서버 URL로 위치 전송 |
| F04 | 로컬 저장 | P1 | 전송 실패 시 로컬에 저장 후 재시도 |
| F05 | 배터리 모드 | P1 | 절약/균형/정확 모드 선택 |
| F06 | 전송 기록 보기 | P2 | 오늘 몇 개 전송했는지 확인 |
| F07 | 수동 ping | P2 | 버튼 눌러서 즉시 위치 전송 |

### 3.2 비기능 요구사항 (Non-Functional)

| ID | 요구사항 | 기준 |
|----|---------|------|
| NF01 | 배터리 소모 | 하루 5% 이하 (균형 모드) |
| NF02 | 정확도 | GPS + 네트워크 혼합, 50m 이내 |
| NF03 | 신뢰성 | 오프라인 시 로컬 저장 → 온라인 복귀 시 전송 |
| NF04 | 프라이버시 | 데이터는 사용자가 설정한 곳에만 전송 |

---

## 4. 기술 스택

### 4.1 앱
```
React Native + TypeScript
├── react-native-background-geolocation (위치)
├── @react-native-async-storage/async-storage (설정/로컬 저장)
├── axios (HTTP 전송)
├── zustand (상태 관리)
└── react-native-paper (UI)
```

### 4.2 데이터 형식
```jsonl
{"ts":"2026-01-29T14:30:00+09:00","lat":35.8714,"lng":128.6014,"acc":10}
{"ts":"2026-01-29T15:00:00+09:00","lat":35.8720,"lng":128.6020,"acc":8}
```

### 4.3 전송 대상 (선택지)
- **텔레그램 봇** → 메시지로 받아서 서버에서 파일로 변환
- **Syncthing** → 로컬 파일로 저장 후 동기화
- **직접 서버** → HTTP POST 받아서 파일에 append

---

## 5. 범위 (Scope)

### 5.1 MVP (1차)
- [x] 백그라운드 위치 수집
- [x] 주기 설정 (30분 고정)
- [x] HTTP POST 전송
- [x] 기본 UI (ON/OFF, 상태 표시)

### 5.2 v1.0
- [ ] 로컬 저장 + 재전송
- [ ] 배터리 모드 선택
- [ ] 전송 기록 보기
- [ ] 수동 ping 버튼

### 5.3 v1.1+
- [ ] 장소 자동 라벨링 (집, 회사, 카페 등)
- [ ] 이동 감지 (정지 중이면 전송 안 함)
- [ ] 위젯

### 5.4 범위 외 (Out of Scope)
- iOS 지원 (추후 고려)
- 서버 구현 (별도 프로젝트)
- 경로 시각화 (Claude Code가 하면 됨)

---

## 6. 성공 기준

| 기준 | 측정 방법 |
|------|----------|
| 본인이 매일 사용 | 1주일 연속 사용 |
| 배터리 부담 없음 | 하루 5% 이하 |
| Claude Code 연동 성공 | "오늘 어디 갔어?" 질문에 정확한 답변 |
| GitHub 공개 | Star 10개 이상 (3개월 내) |

---

## 7. 리스크

| 리스크 | 영향 | 대응 |
|--------|------|------|
| 백그라운드 제한 (Android) | 위치 수집 안 됨 | 배터리 최적화 예외 설정 안내 |
| 배터리 소모 심함 | 사용 안 하게 됨 | 적응형 주기, 이동 감지 |
| react-native-background-geolocation 유료 | 비용 발생 | 무료 대안 검토 또는 구매 |

---

## 8. 일정 (예상)

| 단계 | 기간 | 산출물 |
|------|------|--------|
| Plan | 완료 | 이 문서 |
| Design | 1일 | 설계 문서, 화면 설계 |
| MVP 구현 | 2-3일 | 동작하는 앱 |
| 테스트 | 1일 | 본인 폰에서 테스트 |
| v1.0 | 1주일 | 안정화, 추가 기능 |
| 공개 | - | GitHub, README |

---

## 9. 참고

### 9.1 유사 프로젝트
- [OwnTracks](https://owntracks.org/) - MQTT 기반, 설정 복잡
- [Traccar](https://www.traccar.org/) - 서버 + 클라이언트, 무거움
- [GPSLogger](https://github.com/mendhak/gpslogger) - Android 네이티브, 파일 저장

### 9.2 라이브러리
- [react-native-background-geolocation](https://github.com/transistorsoft/react-native-background-geolocation)
- [react-native-geolocation-service](https://github.com/Agontuk/react-native-geolocation-service) (무료 대안)

---

*작성일: 2026-01-29*
*작성자: 이건희 + Claude*
