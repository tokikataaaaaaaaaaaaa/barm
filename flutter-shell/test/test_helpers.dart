import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

/// Create a ProviderContainer with optional overrides for testing
///
/// Usage:
/// ```dart
/// final container = createTestContainer(
///   overrides: [
///     missionRepositoryProvider.overrideWithValue(mockRepo),
///   ],
/// );
/// ```
ProviderContainer createTestContainer({
  List<Override> overrides = const [],
}) {
  return ProviderContainer(overrides: overrides);
}

/// Helper extension for testing async providers
extension ProviderContainerX on ProviderContainer {
  /// Wait for an async provider to complete and return its value
  Future<T> readAsync<T>(ProviderListenable<AsyncValue<T>> provider) async {
    final value = read(provider);
    return value.when(
      data: (data) => data,
      loading: () => throw StateError('Provider is still loading'),
      error: (e, _) => throw e,
    );
  }
}

/// Get today's date as YYYY-MM-DD string
String getTodayDateString() {
  final now = DateTime.now();
  return '${now.year}-${now.month.toString().padLeft(2, '0')}-${now.day.toString().padLeft(2, '0')}';
}

/// Create a test date string
String createDateString(int year, int month, int day) {
  return '$year-${month.toString().padLeft(2, '0')}-${day.toString().padLeft(2, '0')}';
}
