import http from '@/lib/http'

export function toggleTopicLikeApi(
  id: string,
): Promise<{ liked: boolean; likeCount: number }> {
  return http.post(`/interact/topic/${id}/like`)
}

export function toggleTopicFavoriteApi(
  id: string,
): Promise<{ favorited: boolean; favoriteCount: number }> {
  return http.post(`/interact/topic/${id}/favorite`)
}

export function toggleCommentLikeApi(
  id: string,
): Promise<{ liked: boolean; likeCount: number }> {
  return http.post(`/interact/comment/${id}/like`)
}
