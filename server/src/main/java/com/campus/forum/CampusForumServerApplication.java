package com.campus.forum;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class CampusForumServerApplication {

    public static void main(String[] args) {
        SpringApplication.run(CampusForumServerApplication.class, args);
    }
}
