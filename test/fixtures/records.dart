/// Test fixtures for Record data
class RecordFixtures {
  static const todayRecord = {
    'userId': 'user_test_001',
    'missionId': 'mission_test_001',
    'value': 30,
    'date': '2026-01-02',
    'createdAt': '2026-01-02T10:00:00Z',
    'updatedAt': '2026-01-02T10:00:00Z',
  };

  static const completedRecord = {
    'userId': 'user_test_001',
    'missionId': 'mission_test_001',
    'value': 50,
    'date': '2026-01-01',
    'createdAt': '2026-01-01T20:00:00Z',
    'updatedAt': '2026-01-01T20:00:00Z',
  };

  static const testRecordId1 = 'record_test_001';
  static const testRecordId2 = 'record_test_002';
}
