# BARM (Be A Real Man)

## Project Overview

男性特化の筋トレ×勉強習慣化アプリ

## Tech Stack

### WebView + Flutter Shell 方式

- **Web App:** Next.js 14 (App Router) + React + TailwindCSS
- **Mobile Shell:** Flutter (WebView only) + RevenueCat
- **Backend:** Firebase (Web SDK) - Firestore + Auth
- **Payment:** RevenueCat (Flutter側) + App Store IAP
- **Hosting:** Vercel

## Architecture

### Web App (Next.js)

```
web/
├── src/
│   ├── app/                # App Router pages
│   │   ├── (auth)/        # 認証関連ページ
│   │   ├── missions/      # ミッション管理
│   │   ├── groups/        # グループ機能
│   │   └── settings/      # 設定
│   ├── components/        # UI コンポーネント
│   ├── lib/               # ユーティリティ
│   │   ├── firebase/      # Firebase 設定・操作
│   │   └── bridge/        # Flutter Bridge
│   └── hooks/             # カスタムフック
├── public/
└── package.json
```

### Flutter Shell

```
flutter-shell/
├── lib/
│   ├── main.dart          # Entry point
│   ├── webview/           # WebView 設定
│   ├── bridge/            # JS Bridge (課金通信)
│   └── subscription/      # RevenueCat 連携
└── pubspec.yaml
```

## Commands

### Web App (Next.js)

```bash
cd web

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

### Flutter Shell

```bash
cd flutter-shell

# Run app
flutter run

# Run tests
flutter test

# Build for iOS
flutter build ios --release
```

## Coding Conventions

### Web App
- TypeScript strict mode
- React Server Components (RSC) 活用
- TailwindCSS for styling
- React Query for data fetching

### Flutter Shell
- Minimal code (WebView + RevenueCat only)
- Follow Flutter style guide

## Documentation

See `docs/` for project documentation:
- `brainstorming.md` - Phase 1: アイデア検証
- `strategy.md` - Phase 2: MVP・技術スタック
- `prd.md` - Phase 3: 要件定義
- `tasks.md` - Phase 3: タスク分解
