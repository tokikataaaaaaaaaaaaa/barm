# BARM (Be A Real Man)

## Project Overview

男性特化の筋トレ×勉強習慣化アプリ

## Tech Stack

- Flutter 3.x + Riverpod (状態管理)
- Firebase (Firestore + Auth + FCM + Analytics + Crashlytics)
- RevenueCat + App Store IAP

## Architecture

Feature-first architecture with Riverpod for state management.

```
lib/
├── main.dart           # Entry point
├── app/                # App configuration, routing
├── features/           # Feature modules
│   ├── auth/          # Authentication
│   ├── mission/       # Mission tracking
│   ├── group/         # Group features
│   └── subscription/  # Payment/subscription
├── shared/            # Shared components
│   ├── providers/     # Global providers
│   ├── services/      # API services
│   └── widgets/       # Reusable widgets
└── core/              # Core utilities
    ├── constants/     # App constants
    ├── theme/         # Theme configuration
    └── utils/         # Utility functions
```

## Commands

```bash
# Run app
flutter run

# Run tests
flutter test

# Analyze code
flutter analyze

# Build for iOS
flutter build ios --release

# Generate code (freezed, riverpod_generator)
flutter pub run build_runner build --delete-conflicting-outputs
```

## Coding Conventions

- Use `freezed` for immutable data classes
- Use `riverpod_generator` for providers
- Follow Flutter style guide
- Write tests for business logic

## Documentation

See `docs/` for project documentation:
- `brainstorming.md` - Phase 1: アイデア検証
- `strategy.md` - Phase 2: MVP・技術スタック
- `prd.md` - Phase 3: 要件定義
- `tasks.md` - Phase 3: タスク分解
