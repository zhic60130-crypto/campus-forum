package com.campus.forum.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@Order(1)
@RequiredArgsConstructor
public class SchemaMigrator implements ApplicationRunner {
    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(ApplicationArguments args) {
        ensureBioColumn();
        ensureTopicReportTable();
    }

    private void ensureBioColumn() {
        try {
            jdbcTemplate.execute("ALTER TABLE account ADD COLUMN IF NOT EXISTS bio VARCHAR(500) DEFAULT ''");
        } catch (Exception e) {
            try {
                Integer count = jdbcTemplate.queryForObject(
                        """
                        SELECT COUNT(*) FROM information_schema.COLUMNS
                        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'account' AND COLUMN_NAME = 'bio'
                        """,
                        Integer.class);
                if (count != null && count == 0) {
                    jdbcTemplate.execute("ALTER TABLE account ADD COLUMN bio VARCHAR(500) DEFAULT ''");
                }
            } catch (Exception ignored) {
                log.debug("bio column migration skipped: {}", e.getMessage());
            }
        }
    }

    private void ensureTopicReportTable() {
        try {
            jdbcTemplate.execute("""
                    CREATE TABLE IF NOT EXISTS topic_report (
                        id            BIGINT PRIMARY KEY AUTO_INCREMENT,
                        topic_id      BIGINT       NOT NULL,
                        topic_title   VARCHAR(200) NOT NULL,
                        reporter_id   BIGINT       NOT NULL,
                        reporter_name VARCHAR(64)  NOT NULL,
                        reason        VARCHAR(32)  NOT NULL,
                        detail        VARCHAR(500) DEFAULT '',
                        status        VARCHAR(32)  NOT NULL DEFAULT 'PENDING',
                        admin_id      BIGINT       NULL,
                        admin_note    VARCHAR(500) DEFAULT '',
                        created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        resolved_at   DATETIME     NULL,
                        UNIQUE KEY uk_report_reporter_topic (reporter_id, topic_id),
                        INDEX idx_report_status (status, created_at),
                        INDEX idx_report_topic (topic_id)
                    ) ENGINE=InnoDB
                    """);
        } catch (Exception ex) {
            log.debug("topic_report table migration skipped: {}", ex.getMessage());
        }
    }
}
