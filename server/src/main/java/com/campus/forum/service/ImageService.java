package com.campus.forum.service;

import com.campus.forum.common.BusinessException;
import com.campus.forum.config.ForumProperties;
import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ImageService {
    private final ForumProperties properties;

    public Map<String, String> upload(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("文件不能为空");
        }
        String original = file.getOriginalFilename() == null ? "image.bin" : file.getOriginalFilename();
        String ext = "";
        int dot = original.lastIndexOf('.');
        if (dot >= 0) {
            ext = original.substring(dot);
        }
        String objectName = UUID.randomUUID().toString().replace("-", "") + ext;

        if ("minio".equalsIgnoreCase(properties.getUpload().getMode())) {
            return uploadMinio(file, objectName);
        }
        return uploadLocal(file, objectName);
    }

    private Map<String, String> uploadLocal(MultipartFile file, String objectName) {
        try {
            Path dir = Path.of(properties.getUpload().getLocalDir());
            Files.createDirectories(dir);
            Path target = dir.resolve(objectName);
            file.transferTo(target.toFile());
            String url = properties.getUpload().getPublicBaseUrl().replaceAll("/$", "") + "/" + objectName;
            return Map.of("url", url, "name", objectName);
        } catch (Exception e) {
            throw new BusinessException("本地上传失败: " + e.getMessage());
        }
    }

    private Map<String, String> uploadMinio(MultipartFile file, String objectName) {
        try {
            ForumProperties.Minio cfg = properties.getMinio();
            MinioClient client = MinioClient.builder()
                    .endpoint(cfg.getEndpoint())
                    .credentials(cfg.getAccessKey(), cfg.getSecretKey())
                    .build();
            boolean exists = client.bucketExists(BucketExistsArgs.builder().bucket(cfg.getBucket()).build());
            if (!exists) {
                client.makeBucket(MakeBucketArgs.builder().bucket(cfg.getBucket()).build());
            }
            try (InputStream in = file.getInputStream()) {
                client.putObject(PutObjectArgs.builder()
                        .bucket(cfg.getBucket())
                        .object(objectName)
                        .stream(in, file.getSize(), -1)
                        .contentType(file.getContentType())
                        .build());
            }
            String url = properties.getUpload().getPublicBaseUrl().replaceAll("/$", "") + "/" + objectName;
            return Map.of("url", url, "name", objectName);
        } catch (Exception e) {
            throw new BusinessException("MinIO 上传失败: " + e.getMessage());
        }
    }
}
