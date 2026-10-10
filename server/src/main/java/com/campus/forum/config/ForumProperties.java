package com.campus.forum.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "forum")
public class ForumProperties {
    private Upload upload = new Upload();
    private Minio minio = new Minio();
    private Interact interact = new Interact();

    @Data
    public static class Upload {
        /** local | minio */
        private String mode = "local";
        private String localDir = "./uploads";
        private String publicBaseUrl = "http://localhost:8080/api/files";
    }

    @Data
    public static class Minio {
        private String endpoint = "http://127.0.0.1:9000";
        private String accessKey = "minioadmin";
        private String secretKey = "minioadmin";
        private String bucket = "campus-forum";
    }

    @Data
    public static class Interact {
        private boolean memoryFallback = true;
        private String syncCron = "0 */5 * * * *";
    }
}
