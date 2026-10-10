import http from '@/lib/http'

export type UploadImageResult = {
  url: string
  name: string
}

export function uploadImageApi(file: File): Promise<UploadImageResult> {
  const form = new FormData()
  form.append('file', file)
  return http.post('/image/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
