export function toDbFormat(name: string | undefined) {
  return name?.trim().split(' ').join('-')
}

export function fromDbFormat(name: string | undefined) {
  return name?.split('-').join(' ')
}
