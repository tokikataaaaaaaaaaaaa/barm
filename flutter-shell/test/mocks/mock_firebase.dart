import 'package:fake_cloud_firestore/fake_cloud_firestore.dart';

/// Create a FakeFirebaseFirestore instance for testing
///
/// Usage:
/// ```dart
/// final fakeFirestore = createFakeFirestore();
/// final repository = MissionRepository(fakeFirestore);
/// ```
FakeFirebaseFirestore createFakeFirestore() {
  return FakeFirebaseFirestore();
}

/// Helper to seed Firestore with test data
///
/// Usage:
/// ```dart
/// final firestore = createFakeFirestore();
/// await seedTestData(firestore, 'users', 'user123', {'name': 'Test'});
/// ```
Future<void> seedTestData(
  FakeFirebaseFirestore firestore,
  String collection,
  String docId,
  Map<String, dynamic> data,
) async {
  await firestore.collection(collection).doc(docId).set(data);
}

// Mock for Firebase Auth (basic structure)
// Full implementation will be added when AuthRepository is implemented
// class MockFirebaseAuth extends Mock implements FirebaseAuth {}
