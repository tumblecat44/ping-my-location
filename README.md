# LifePing 📍

> 위치를 자동으로 수집하여 AI가 읽을 수 있는 형식으로 저장하는 앱

## 왜 만들었나?

"오늘 어디 갔어?"라는 질문에 AI가 답할 수 있게 하려고.

AI Native Life를 살기 위해서는 내 데이터가 AI가 접근할 수 있는 형태로 있어야 합니다. 위치 데이터도 마찬가지입니다.

## 기능

- 📍 **백그라운드 위치 수집** — 앱을 꺼도 주기적으로 위치 기록
- 🔄 **자동 전송** — 설정한 서버로 HTTP POST
- 💾 **오프라인 지원** — 전송 실패 시 로컬에 저장 후 재시도
- 🔋 **배터리 최적화** — 절약/균형/정확 모드 선택
- 📊 **JSONL 형식** — Claude Code 등 AI가 바로 읽을 수 있음

## 데이터 형식

```jsonl
{"ts":"2026-01-29T14:30:00+09:00","lat":35.8714,"lng":128.6014,"acc":10,"label":"auto"}
{"ts":"2026-01-29T15:00:00+09:00","lat":35.8720,"lng":128.6020,"acc":8,"label":"auto"}
```

| 필드 | 설명 |
|------|------|
| `ts` | ISO 8601 타임스탬프 |
| `lat` | 위도 |
| `lng` | 경도 |
| `acc` | 정확도 (미터) |
| `label` | `auto` (자동) / `manual` (수동) |

## 기술 스택

- React Native + TypeScript
- Zustand (상태 관리)
- React Native Paper (UI)
- Axios (HTTP)

## 설치

```bash
# 클론
git clone https://github.com/tumblecat44/ping-my-location.git
cd ping-my-location

# 의존성 설치
npm install

# Android 빌드
npx react-native run-android
```

## 사용법

1. **서버 URL 설정** — 설정 화면에서 위치를 받을 서버 URL 입력
2. **시작** — 홈 화면에서 "시작하기" 버튼 탭
3. **끝** — 알아서 주기적으로 전송됨

### 서버 예시

텔레그램 봇으로 받으려면:
```
https://api.telegram.org/bot{TOKEN}/sendMessage?chat_id={CHAT_ID}&text=
```

또는 간단한 서버:
```javascript
// Node.js + Express
app.post('/ping', (req, res) => {
  const { ts, lat, lng, acc } = req.body;
  fs.appendFileSync('locations.jsonl', JSON.stringify(req.body) + '\n');
  res.sendStatus(200);
});
```

## 화면

| 홈 | 설정 |
|:--:|:--:|
| 추적 ON/OFF, 상태, 통계 | 서버 URL, 주기, 배터리 모드 |

## 로드맵

- [x] MVP (위치 수집 + 전송)
- [x] 로컬 큐 (오프라인 지원)
- [ ] 백그라운드 추적 개선
- [ ] 장소 자동 라벨링 (집, 회사 등)
- [ ] 이동 감지 (정지 중이면 전송 안 함)
- [ ] F-Droid 배포

## AI Native Life

이 앱은 [AI Native Life](https://github.com/tumblecat44/ai-native-life) 프로젝트의 일부입니다.

AI를 외장뇌처럼 쓰려면 내 데이터가 AI가 읽을 수 있는 형태로 있어야 합니다.

- 위치 → LifePing (이 앱)
- 건강 데이터 → TBD
- 일정 → Google Calendar API
- 생각/메모 → Claude Code

## 라이선스

MIT

---

*Made with Claude Code*
