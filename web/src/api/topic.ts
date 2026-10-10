import http from '@/lib/http'
import type {
  Comment,
  CreateCommentInput,
  CreateTopicInput,
  PageResult,
  Topic,
  TopicQuery,
} from '@/types'

export function fetchTopicsApi(
  query: TopicQuery = {},
): Promise<PageResult<Topic>> {
  return http.get('/topics', { params: query })
}

export function fetchTopicApi(id: string): Promise<Topic> {
  return http.get(`/topics/${id}`)
}

export function createTopicApi(input: CreateTopicInput): Promise<Topic> {
  return http.post('/topics', {
    title: input.title,
    content: input.summary,
    categoryId: input.categoryId,
    tagIds: input.tagIds,
    images: input.images ?? [],
  })
}

export function deleteTopicApi(id: string): Promise<void> {
  return http.delete(`/topics/${id}`)
}

export function fetchMyTopicsApi(
  page = 1,
  size = 10,
): Promise<PageResult<Topic>> {
  return http.get('/topics/mine', { params: { page, size } })
}

export function fetchFavoriteTopicsApi(
  page = 1,
  size = 10,
): Promise<PageResult<Topic>> {
  return http.get('/topics/favorites', { params: { page, size } })
}

export function fetchCommentsApi(postId: string): Promise<Comment[]> {
  return http.get(`/topics/${postId}/comments`)
}

export function createCommentApi(
  postId: string,
  input: CreateCommentInput,
): Promise<Comment> {
  return http.post(`/topics/${postId}/comments`, {
    content: input.content,
    parentId: input.parentId ?? null,
    replyToName: input.replyToName ?? null,
  })
}

export function deleteCommentApi(
  postId: string,
  commentId: string,
): Promise<void> {
  return http.delete(`/topics/${postId}/comments/${commentId}`)
}
