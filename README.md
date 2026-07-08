# DOMO — 우리만의 집

커플이 함께 목표와 습관을 이어가는 PWA. 초대로 연결한 두 사람이 '우리 집'이라는 공간에서 개인·커플 미션을 만들고, 10초 인증과 이모지 응원, 잔디(히트맵) 시각화로 꾸준함을 쌓습니다.

## 기술 스택

- React + TypeScript + Vite
- Tailwind CSS v4
- vite-plugin-pwa (매니페스트, 서비스 워커, 오프라인 캐싱)
- zustand (localStorage에 영속되는 클라이언트 상태 — 프론트엔드 데모 단계로 실제 백엔드 없이 동작)
- react-router-dom

## 개발

```bash
npm install
npm run dev      # 개발 서버
npm run build    # 타입체크 + 프로덕션 빌드 (서비스 워커 포함)
npm run preview  # 빌드 결과 미리보기 (PWA/오프라인 동작 확인용)
```

## 구조

- `src/pages` — 화면 (온보딩, 거실/미션/잔디/우편함/마이)
- `src/store/useAppStore.ts` — 전체 앱 상태 (커플, 미션, 인증, 반응, 알림, 포인트/뱃지, 설정)
- `src/lib` — 날짜/스트릭 계산, 선택자, 목업 시드 데이터, 이미지 압축 등
- `src/components` — 공통 UI, 아이콘, 잔디 히트맵, 하단 네비게이션 등
- `scripts/generate-icons.mjs` — 앱 아이콘(PNG) 생성 스크립트 (sharp 필요)

## 참고

현재는 프론트엔드 우선 데모 단계로, Supabase 연동·웹 푸시 서버·서버 측 암호화 등 실제 인프라는 포함되어 있지 않습니다. 모든 데이터는 브라우저 `localStorage`에 저장되며, 서비스 워커를 통해 오프라인에서도 조회/기록이 가능합니다.
