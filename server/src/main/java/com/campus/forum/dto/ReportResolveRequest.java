package com.campus.forum.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ReportResolveRequest {
    /** DISMISS | DELETE_TOPIC */
    @NotBlank(message = "请选择处理方式")
    private String action;

    @Size(max = 500, message = "备注不能超过 500 字")
    private String adminNote;
}
