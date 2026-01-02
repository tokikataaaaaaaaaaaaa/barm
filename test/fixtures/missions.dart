/// Test fixtures for Mission data
class MissionFixtures {
  static const workoutMission = {
    'userId': 'user_test_001',
    'type': 'workout',
    'name': '腕立て伏せ',
    'targetValue': 50,
    'unit': '回',
    'isActive': true,
    'sortOrder': 0,
    'createdAt': '2026-01-01T00:00:00Z',
    'updatedAt': '2026-01-01T00:00:00Z',
  };

  static const studyMission = {
    'userId': 'user_test_001',
    'type': 'study',
    'name': '英語リーディング',
    'targetValue': 30,
    'unit': '分',
    'isActive': true,
    'sortOrder': 1,
    'createdAt': '2026-01-01T00:00:00Z',
    'updatedAt': '2026-01-01T00:00:00Z',
  };

  static const inactiveMission = {
    'userId': 'user_test_001',
    'type': 'workout',
    'name': 'スクワット',
    'targetValue': 30,
    'unit': '回',
    'isActive': false,
    'sortOrder': 2,
    'createdAt': '2026-01-01T00:00:00Z',
    'updatedAt': '2026-01-01T00:00:00Z',
  };

  static const testMissionId1 = 'mission_test_001';
  static const testMissionId2 = 'mission_test_002';
}
