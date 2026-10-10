-- Demo accounts (admin, pixel, nova) are inserted by DataSeeder when the account table is empty.
-- Password for those accounts: 123456 (same password as server/sql/data.sql).

MERGE INTO category (id, label, color, icon, desc_text, sort) KEY(id) VALUES
('daily', '日常闲聊', '#409EFF', 'ChatDotRound', '生活琐事与轻松话题', 1),
('friend', '真诚交友', '#9B6DFF', 'User', '找搭子、扩人脉', 2),
('feedback', '问题反馈', '#F56C6C', 'Warning', '吐槽与改进建议', 3),
('hobby', '兴趣爱好', '#67C23A', 'MagicStick', '兴趣圈层与作品分享', 4),
('resource', '资源互助', '#E6A23C', 'FolderOpened', '资料、工具与互助求援', 5);

MERGE INTO tag (id, label) KEY(id) VALUES
('campus', '校园生活'),
('food', '美食'),
('study', '学习'),
('sport', '运动'),
('help', '求助'),
('share', '分享'),
('hobby', '兴趣');
