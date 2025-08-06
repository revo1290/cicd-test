-- テストデータの投入
INSERT INTO tasks (title, description, completed, priority) VALUES
('JUnitテストケースを作成', 'TaskServiceクラスの単体テストを作成する', false, 'HIGH'),
('GitHub Actionsワークフロー設定', 'CI/CDパイプラインの設定ファイルを作成', true, 'MEDIUM'),
('Cypressテストの実装', 'E2Eテストシナリオを作成する', false, 'HIGH'),
('Dockerコンテナ化', 'アプリケーションをコンテナ化する', false, 'MEDIUM'),
('データベース設計', 'タスク管理用のテーブル設計', true, 'HIGH'),
('API仕様書作成', 'REST APIの仕様書をSwaggerで作成', false, 'LOW'),
('セキュリティテスト', 'OWASP ZAPを使用したセキュリティテスト', false, 'MEDIUM'),
('パフォーマンステスト', 'JMeterを使用した負荷テスト', false, 'LOW');

-- テスト用ユーザーデータ
INSERT INTO users (username, email, password_hash) VALUES
('testuser1', 'test1@example.com', '$2a$10$example_hash_1'),
('testuser2', 'test2@example.com', '$2a$10$example_hash_2'),
('admin', 'admin@example.com', '$2a$10$example_hash_admin');

-- ユーザーとタスクの関連付け
INSERT INTO user_tasks (user_id, task_id) VALUES
(1, 1), (1, 2), (1, 3),
(2, 4), (2, 5), (2, 6),
(3, 7), (3, 8);
