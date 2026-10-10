package com.campus.forum.schedule;

import com.campus.forum.service.InteractService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class InteractSyncTask {
    private final InteractService interactService;

    @Scheduled(cron = "${forum.interact.sync-cron:0 */5 * * * *}")
    public void sync() {
        try {
            interactService.syncToDatabase();
        } catch (Exception e) {
            log.warn("Interact sync failed: {}", e.getMessage());
        }
    }
}
