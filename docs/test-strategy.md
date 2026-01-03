# BARM - Test Strategy

**Version:** 2.0
**Created:** 2026-01-02
**Updated:** 2026-01-03
**Status:** Draft

---

## 1. Architecture Overview (WebView + Flutter Shell)

```
+------------------------------------------+
|           Flutter Shell (iOS)            |
|  +------------------------------------+  |
|  |            WebView                 |  |
|  |  +------------------------------+  |  |
|  |  |       Next.js App            |  |  |
|  |  |  (React + TypeScript)        |  |  |
|  |  +------------------------------+  |  |
|  +------------------------------------+  |
|                                          |
|  Native Bridge (Apple Sign In, IAP)      |
+------------------------------------------+
```

**Test Focus:**
- **Web (Next.js):** Main test coverage (90%+ of tests)
- **Flutter Shell:** Minimal tests (Native Bridge only)

---

## 2. Test Pyramid

### 2.1 Web (Next.js) - Primary

```
                    +----------+
                    |   E2E    |  10%
                    |Playwright|
                    +----+-----+
                         |
                +--------+--------+
                | Integration     |  30%
                | Component Tests |
                +--------+--------+
                         |
    +--------------------+--------------------+
    |              Unit Tests                 |  60%
    |    (Hooks, Utils, API, Domain)          |
    +-----------------------------------------+
```

| Level | Ratio | Target | Tools |
|-------|-------|--------|-------|
| **Unit** | 60% | Hooks, Utils, API handlers, Domain logic | Vitest |
| **Integration** | 30% | React Components, Pages | Vitest + React Testing Library |
| **E2E** | 10% | Critical user flows | Playwright |

### 2.2 Mobile Shell (Flutter) - Minimal

```
    +--------------------+
    |    Widget Tests    |  (Native Bridge UI)
    +--------------------+
              |
    +--------------------+
    |    Unit Tests      |  (Native Bridge logic)
    +--------------------+
```

| Level | Target | Tools |
|-------|--------|-------|
| **Unit** | Native Bridge handlers | flutter_test |
| **Widget** | WebView integration, Native dialogs | flutter_test |

---

## 3. Coverage Goals

### 3.1 Web (Next.js)

| Target | Goal |
|--------|------|
| **Domain Models/Types** | 100% |
| **API Routes** | 80% |
| **Custom Hooks** | 80% |
| **Components (Critical)** | 70% |
| **Overall** | 75% |

### 3.2 Flutter Shell

| Target | Goal |
|--------|------|
| **Native Bridge** | 80% |
| **WebView Setup** | 50% |
| **Overall** | 60% |

---

## 4. Test Priorities

### 4.1 Web - Must Test (Critical Path)

PRD requirements mapped to Web tests.

| Feature | Test Target | Level |
|---------|-------------|-------|
| **F-001: Auth** | Apple Sign In callback handling | Integration |
| | Auth state persistence (cookies/storage) | Unit |
| | Protected route redirect | Integration |
| **F-002: Mission Setup** | Mission form validation | Unit |
| | Mission CRUD API routes | Integration |
| | Mission creation page | Integration |
| **F-003: Record Tracking** | Record model validation | Unit |
| | Streak calculation logic | Unit |
| | Record upsert API | Integration |
| **F-004: Groups** | Invite code generation/validation | Unit |
| | Group join/leave API | Integration |
| **F-005: View Records** | Group members record fetch | Integration |
| **F-006: Subscription** | Subscription state check | Unit |
| | Paywall display logic | Integration |

### 4.2 Flutter Shell - Must Test

| Feature | Test Target | Level |
|---------|-------------|-------|
| **Native Bridge** | Apple Sign In handler | Unit |
| | RevenueCat purchase handler | Unit |
| | JS-to-Native message parsing | Unit |
| **WebView** | URL loading | Widget |
| | JavaScript channel setup | Widget |

### 4.3 Should Test (Important)

| Category | Test Target |
|----------|-------------|
| **Validation** | Nickname (1-20 chars) |
| | Mission name (1-50 chars) |
| | Target value (> 0) |
| **Error Handling** | Network error UI |
| | API error responses |
| **Boundary Values** | Max 10 missions limit |
| | Max 5 group members limit |
| | 1 user 1 group limit |

### 4.4 Won't Test (Low Priority)

| Target | Reason |
|--------|--------|
| UI styling/layout | Visual regression tests have low ROI |
| Animations | Manual verification sufficient |
| Firebase SDK internals | Trust external library |
| RevenueCat SDK internals | Trust external library |
| WebView rendering | Trust platform WebView |

---

## 5. Mock Strategy

### 5.1 Web (Next.js) Mocking

| Dependency | Mock Method | Notes |
|------------|-------------|-------|
| **API calls** | MSW (Mock Service Worker) | Intercept fetch/axios |
| **Firebase Auth** | Firebase Emulator | Local emulator for integration |
| **Firestore** | Firebase Emulator | Local emulator for integration |
| **Native Bridge** | Mock window.flutter_inappwebview | Stub JS interface |

### 5.2 MSW Setup Example

```typescript
// src/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  // Mission API
  http.get('/api/missions', () => {
    return HttpResponse.json([
      {
        id: 'mission-1',
        name: 'Push-ups',
        type: 'workout',
        targetValue: 50,
        unit: 'reps',
      },
    ]);
  }),

  http.post('/api/missions', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      id: 'new-mission-id',
      ...body,
      createdAt: new Date().toISOString(),
    });
  }),

  // Auth API
  http.get('/api/auth/session', () => {
    return HttpResponse.json({
      user: {
        id: 'user-123',
        displayName: 'Test User',
      },
    });
  }),
];
```

### 5.3 Firebase Emulator Setup

```typescript
// src/lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

if (process.env.NODE_ENV === 'test') {
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectAuthEmulator(auth, 'http://localhost:9099');
}
```

### 5.4 Native Bridge Mock

```typescript
// src/mocks/native-bridge.ts
export const mockNativeBridge = {
  callHandler: vi.fn((name: string, args: unknown) => {
    switch (name) {
      case 'signInWithApple':
        return Promise.resolve({
          idToken: 'mock-id-token',
          authorizationCode: 'mock-auth-code',
        });
      case 'purchase':
        return Promise.resolve({
          success: true,
          transactionId: 'mock-txn-123',
        });
      default:
        return Promise.reject(new Error(`Unknown handler: ${name}`));
    }
  }),
};

// Setup in test
beforeEach(() => {
  window.flutter_inappwebview = mockNativeBridge;
});
```

### 5.5 Flutter Native Bridge Testing

```dart
// test/unit/native_bridge_test.dart
void main() {
  group('NativeBridge', () {
    late NativeBridge bridge;
    late MockWebViewController mockController;

    setUp(() {
      mockController = MockWebViewController();
      bridge = NativeBridge(mockController);
    });

    test('should handle signInWithApple request', () async {
      // Arrange
      final request = {
        'action': 'signInWithApple',
        'callbackId': 'callback-123',
      };

      // Act
      await bridge.handleMessage(jsonEncode(request));

      // Assert
      verify(() => mockController.evaluateJavascript(
        argThat(contains('callback-123')),
      )).called(1);
    });
  });
}
```

---

## 6. Test Data Strategy

### 6.1 Fixtures (Web)

```
src/
├── mocks/
│   ├── handlers.ts       # MSW request handlers
│   ├── server.ts         # MSW server setup
│   └── fixtures/
│       ├── users.ts      # Test user data
│       ├── missions.ts   # Test mission data
│       ├── records.ts    # Test record data
│       └── groups.ts     # Test group data
```

**Example: fixtures/users.ts**
```typescript
export const testUsers = {
  basic: {
    id: 'user-1',
    displayName: 'Test Taro',
    groupId: null,
    createdAt: '2026-01-01T00:00:00Z',
  },
  withGroup: {
    id: 'user-2',
    displayName: 'Group Taro',
    groupId: 'group-123',
    createdAt: '2026-01-01T00:00:00Z',
  },
  premium: {
    id: 'user-3',
    displayName: 'Premium User',
    subscriptionStatus: 'active',
    createdAt: '2026-01-01T00:00:00Z',
  },
};
```

### 6.2 Test Factories

```typescript
// src/mocks/factories/mission.ts
import { faker } from '@faker-js/faker';
import type { Mission } from '@/types';

export function createMission(overrides: Partial<Mission> = {}): Mission {
  return {
    id: faker.string.uuid(),
    name: faker.lorem.words(2),
    type: faker.helpers.arrayElement(['workout', 'study']),
    targetValue: faker.number.int({ min: 1, max: 100 }),
    unit: faker.helpers.arrayElement(['reps', 'minutes', 'pages']),
    createdAt: faker.date.past().toISOString(),
    ...overrides,
  };
}
```

---

## 7. Test File Organization

### 7.1 Web (Next.js)

```
src/
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       ├── page.tsx
│   │       └── page.test.tsx        # Co-located test
│   ├── missions/
│   │   ├── page.tsx
│   │   └── page.test.tsx
│   └── api/
│       ├── missions/
│       │   ├── route.ts
│       │   └── route.test.ts
│       └── auth/
│           └── [...]/
│
├── components/
│   ├── mission-card/
│   │   ├── index.tsx
│   │   └── mission-card.test.tsx
│   └── ui/
│       └── button/
│           ├── index.tsx
│           └── button.test.tsx
│
├── hooks/
│   ├── use-missions.ts
│   ├── use-missions.test.ts
│   ├── use-auth.ts
│   └── use-auth.test.ts
│
├── lib/
│   ├── utils/
│   │   ├── date.ts
│   │   ├── date.test.ts
│   │   ├── validators.ts
│   │   └── validators.test.ts
│   └── domain/
│       ├── mission.ts
│       ├── mission.test.ts
│       ├── streak.ts
│       └── streak.test.ts
│
├── mocks/
│   ├── handlers.ts
│   ├── server.ts
│   └── fixtures/
│
└── e2e/
    ├── auth.spec.ts
    ├── missions.spec.ts
    └── groups.spec.ts
```

### 7.2 Flutter Shell

```
test/
├── unit/
│   ├── native_bridge_test.dart
│   ├── apple_sign_in_handler_test.dart
│   └── purchase_handler_test.dart
│
├── widget/
│   ├── webview_container_test.dart
│   └── native_dialog_test.dart
│
└── mocks/
    ├── mock_webview_controller.dart
    └── mock_platform_channel.dart
```

---

## 8. Test Naming Convention

### 8.1 Web (Vitest)

```typescript
// describe -> it pattern
describe('MissionService', () => {
  describe('create()', () => {
    it('should create mission with valid input', () => {});
    it('should throw ValidationError when name is empty', () => {});
    it('should throw ValidationError when targetValue is zero', () => {});
  });

  describe('delete()', () => {
    it('should delete existing mission', () => {});
    it('should throw NotFoundError when mission does not exist', () => {});
  });
});
```

**Naming pattern:** `should {expected behavior} when {condition}`

### 8.2 Flutter

```dart
// Same pattern with group/test
group('NativeBridge', () {
  group('handleMessage()', () {
    test('should return auth result when signInWithApple succeeds', () {});
    test('should return error when signInWithApple fails', () {});
  });
});
```

---

## 9. CI Integration

### 9.1 GitHub Actions (ci.yml)

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  # Web Tests
  test-web:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: web/package-lock.json

      - name: Install dependencies
        run: npm ci
        working-directory: web

      - name: Run unit & integration tests
        run: npm run test:coverage
        working-directory: web

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v4
        with:
          files: web/coverage/lcov.info
          flags: web
          fail_ci_if_error: false

  # E2E Tests
  test-e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: web/package-lock.json

      - name: Install dependencies
        run: npm ci
        working-directory: web

      - name: Install Playwright browsers
        run: npx playwright install --with-deps
        working-directory: web

      - name: Run E2E tests
        run: npm run test:e2e
        working-directory: web

  # Flutter Shell Tests (Minimal)
  test-flutter:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Flutter
        uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.24.0'
          channel: 'stable'
          cache: true

      - name: Install dependencies
        run: flutter pub get
        working-directory: mobile

      - name: Run tests
        run: flutter test --coverage
        working-directory: mobile

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v4
        with:
          files: mobile/coverage/lcov.info
          flags: flutter
          fail_ci_if_error: false
```

### 9.2 PR Requirements

| Condition | Required |
|-----------|----------|
| Web tests pass | Yes |
| Flutter tests pass | Yes |
| E2E tests pass | Yes |
| Coverage decrease | Warning (non-blocking) |
| Lint errors | Yes |

---

## 10. TDD Workflow (Phase 7+)

```
1. Review acceptance criteria
   |
2. Write failing test (Red)
   |
3. Write minimal code to pass (Green)
   |
4. Refactor
   |
5. Next test
```

### Priority Order

1. **Domain Logic (Web)** - Test first (no dependencies)
2. **API Routes (Web)** - Test with MSW
3. **Hooks (Web)** - Test with MSW
4. **Components (Web)** - Test with React Testing Library
5. **Native Bridge (Flutter)** - Test handlers
6. **E2E** - Critical paths only

---

## 11. Testing Dependencies

### 11.1 Web (package.json)

```json
{
  "devDependencies": {
    "vitest": "^2.0.0",
    "@testing-library/react": "^16.0.0",
    "@testing-library/user-event": "^14.5.0",
    "@vitejs/plugin-react": "^4.3.0",
    "jsdom": "^24.0.0",
    "msw": "^2.3.0",
    "@faker-js/faker": "^8.4.0",
    "playwright": "^1.45.0",
    "@playwright/test": "^1.45.0"
  }
}
```

### 11.2 Vitest Config

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/mocks/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      exclude: ['src/mocks/**', '**/*.d.ts'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### 11.3 Playwright Config

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './src/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 14'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### 11.4 Flutter (pubspec.yaml)

```yaml
# pubspec.yaml
dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^4.0.0
  mocktail: ^1.0.1
```

---

## 12. MSW Test Setup

```typescript
// src/mocks/setup.ts
import { beforeAll, afterAll, afterEach } from 'vitest';
import { server } from './server';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterAll(() => server.close());
afterEach(() => server.resetHandlers());
```

```typescript
// src/mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

---

## Change Log

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-02 | Initial version (Flutter-only) |
| 2.0 | 2026-01-03 | Updated for WebView + Flutter Shell architecture |
