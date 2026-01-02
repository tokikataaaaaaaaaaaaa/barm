# BARM (Be A Real Man)

男性特化の筋トレ×勉強習慣化アプリ

## Overview

「一人じゃ続かない。だから、男5人で変わる。」

BARMは、筋トレと勉強の習慣化を支援するiOSアプリです。3〜5人の小グループで目標を共有し、互いの記録を見て刺激し合うことで継続をサポートします。

## Features

- ミッション設定・トラッキング（筋トレ/勉強）
- 仲間の記録閲覧（3-5人の小グループ）
- 達成ベースのサブスク割引（月300円 → 達成時100円）

## Tech Stack

- **Frontend:** Flutter + Riverpod
- **Backend:** Firebase (Firestore + Auth + FCM)
- **Payment:** RevenueCat + App Store IAP
- **Analytics:** Firebase Analytics + Crashlytics

## Getting Started

### Prerequisites

- Flutter SDK 3.x
- Xcode 15+
- CocoaPods
- Firebase CLI

### Setup

```bash
# Install dependencies
flutter pub get

# iOS setup
cd ios && pod install && cd ..

# Run the app
flutter run
```

## Project Structure

```
lib/
├── main.dart
├── app/
│   ├── app.dart
│   └── router.dart
├── features/
│   ├── auth/
│   ├── mission/
│   ├── group/
│   └── subscription/
├── shared/
│   ├── providers/
│   ├── services/
│   └── widgets/
└── core/
    ├── constants/
    ├── theme/
    └── utils/
```

## Documentation

- [Brainstorming](docs/brainstorming.md) - Phase 1: アイデア検証
- [Strategy](docs/strategy.md) - Phase 2: MVP・技術スタック
- [PRD](docs/prd.md) - Phase 3: 要件定義
- [Tasks](docs/tasks.md) - Phase 3: タスク分解

## License

Private - All rights reserved
