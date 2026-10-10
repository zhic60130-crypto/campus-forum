package com.campus.forum.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.campus.forum.entity.TopicTag;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface TopicTagMapper extends BaseMapper<TopicTag> {

    @Select("SELECT tag_id FROM topic_tag WHERE topic_id = #{topicId}")
    List<String> findTagIds(@Param("topicId") Long topicId);

    @Delete("DELETE FROM topic_tag WHERE topic_id = #{topicId}")
    int deleteByTopicId(@Param("topicId") Long topicId);

    @Delete("DELETE FROM topic_tag WHERE tag_id = #{tagId}")
    int deleteByTagId(@Param("tagId") String tagId);

    @Select("SELECT COUNT(*) FROM topic_tag WHERE tag_id = #{tagId}")
    long countByTagId(@Param("tagId") String tagId);

    @Select("""
            SELECT category_id AS k, COUNT(*) AS c FROM topic GROUP BY category_id
            """)
    List<java.util.Map<String, Object>> countByCategory();

    @Select("""
            SELECT tag_id AS k, COUNT(*) AS c FROM topic_tag GROUP BY tag_id
            """)
    List<java.util.Map<String, Object>> countByTag();
}
