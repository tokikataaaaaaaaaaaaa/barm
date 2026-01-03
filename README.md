# BARM (Be A Real Man)

男性特化の筋トレ×勉強習慣化アプリ

## Overview

「一人じゃ続かない。だから、男5人で変わる。」

BARMは、筋トレと勉強の習慣化を支援するiOSアプリです。3〜5人の小グループで目標を共有し、互いの記録を見て刺激し合うことで継続をサポートします。

## Features

- ミッション設定・トラッキング（筋トレ/勉強）
- 仲間の記録閲覧（3-5人の小グループ）
- 達成ベースのサブスク割引（月300円 → 達成時100円）

## Architecture

**WebView + Flutter Shell 方式**を採用し、高速リリースサイクルを実現します。

```
┌─────────────────────────────────────────────────────┐
│                    iOS App                          │
│  ┌───────────────────────────────────────────────┐  │
│  │         Flutter Shell (WebView)              │  │
│  │  ┌─────────────────────────────────────────┐  │  │
│  │  │         Next.js Web App                 │  │  │
│  │  │         (Vercel hosted)                 │  │  │
│  │  └─────────────────────────────────────────┘  │  │
│  │                                               │  │
│  │  ┌─────────────┐   ┌─────────────────────┐   │  │
│  │  │ RevenueCat  │   │ Native Bridge       │   │  │
│  │  │ (課金処理)  │   │ (JS <-> Flutter)    │   │  │
│  │  └─────────────┘   └─────────────────────┘   │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │      Firebase         │
              │   (Web SDK経由)       │
              └───────────────────────┘
```

## Tech Stack

### Web App
- **Framework:** Next.js 14 (App Router) + React
- **Styling:** TailwindCSS + shadcn/ui
- **State:** Zustand + React Query
- **Backend:** Firebase (Web SDK) - Firestore + Auth
- **Hosting:** Vercel

### Flutter Shell
- **WebView:** flutter_inappwebview
- **Payment:** RevenueCat + App Store IAP
- **Notifications:** Firebase Cloud Messaging

## Getting Started

### Prerequisites

- Node.js 20+
- Flutter SDK 3.24+
- Xcode 15+
- Firebase CLI

### Web App Setup

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

### Flutter Shell Setup

```bash
cd flutter-shell

# Install dependencies
flutter pub get

# iOS setup
cd ios && pod install && cd ..

# Run the app
flutter run
```

## Project Structure

```
barm/
├── web/                    # Next.js Web App
│   ├── src/
│   │   ├── app/           # App Router pages
│   │   ├── components/    # UI components
│   │   ├── lib/           # Utilities & Firebase
│   │   └── hooks/         # Custom hooks
│   └── package.json
│
├── flutter-shell/          # Flutter Shell (minimal)
│   ├── lib/
│   │   ├── main.dart
│   │   ├── webview/       # WebView configuration
│   │   ├── bridge/        # Native Bridge
│   │   └── subscription/  # RevenueCat integration
│   └── pubspec.yaml
│
├── docs/                   # Documentation
└── .github/                # CI/CD workflows
```

## Documentation

- [Brainstorming](docs/brainstorming.md) - Phase 1: アイデア検証
- [Strategy](docs/strategy.md) - Phase 2: MVP・技術スタック
- [Architecture](docs/architecture.md) - Phase 5: 技術設計
- [Test Strategy](docs/test-strategy.md) - Phase 6: テスト戦略

## License

Private - All rights reserved
