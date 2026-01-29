# LifePing - Claude 지침

## 프로젝트 개요

**LifePing**은 위치를 자동으로 수집하여 Claude Code가 읽을 수 있는 형식으로 저장하는 React Native 앱입니다.

- **목적**: AI Native Life를 위한 위치 데이터 자동 수집
- **스택**: React Native + TypeScript
- **라이선스**: 오픈소스 (MIT)

## 기술 스택

```
React Native + TypeScript
├── react-native-background-geolocation (위치 추적)
├── @react-native-async-storage/async-storage (로컬 저장)
├── axios (HTTP 전송)
├── zustand (상태 관리)
└── react-native-paper (UI)
```

## 프로젝트 구조

```
lifeping/
├── CLAUDE.md           # 이 파일
├── docs/               # PDCA 문서
│   ├── 01-plan/
│   ├── 02-design/
│   ├── 03-analysis/
│   └── 04-report/
├── src/                # 소스 코드
│   ├── components/
│   ├── screens/
│   ├── services/
│   ├── stores/
│   └── types/
├── android/            # Android 네이티브
└── package.json
```

## 데이터 형식

위치 데이터는 JSONL 형식으로 저장:

```jsonl
{"ts":"2026-01-29T14:30:00+09:00","lat":35.8714,"lng":128.6014,"acc":10}
{"ts":"2026-01-29T15:00:00+09:00","lat":35.8720,"lng":128.6020,"acc":8}
```

| 필드 | 설명 |
|------|------|
| ts | ISO 8601 타임스탬프 |
| lat | 위도 |
| lng | 경도 |
| acc | 정확도 (미터) |

## PDCA 상태

| Phase | Status | Document |
|-------|--------|----------|
| Plan | ✅ 완료 | `docs/01-plan/features/lifeping.plan.md` |
| Design | ✅ 완료 | `docs/02-design/features/lifeping.design.md` |
| Do | ✅ MVP 완료 | 소스코드 `src/` |
| Check | ⏳ 대기 | - |
| Report | ○ | - |

## 개발 규칙

### 코드 스타일
- TypeScript strict mode
- 함수형 컴포넌트 + hooks
- 네이밍: camelCase (변수/함수), PascalCase (컴포넌트/타입)

### 커밋 메시지
```
feat: 새 기능
fix: 버그 수정
docs: 문서
refactor: 리팩토링
chore: 빌드/설정
```

### 브랜치
- `main`: 안정 버전
- `dev`: 개발 중
- `feature/*`: 기능 개발

## 관련 문서

- Plan: `docs/01-plan/features/lifeping.plan.md`
- 상위 프로젝트: `/Users/dgsw67/ai-native-life/`

---

*마지막 수정: 2026-01-29*
