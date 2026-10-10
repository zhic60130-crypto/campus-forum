export function delay(ms = 120): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function nowIso(): string {
  return new Date().toISOString()
}

export function toPublicUser<T extends { password?: string }>(user: T) {
  const { password: _p, ...rest } = user
  return rest
}
