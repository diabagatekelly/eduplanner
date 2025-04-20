export function toDbFormat(name) {
  return name?.trim().split(' ').join('-')
}

export function fromDbFormat(name) {
  return name?.split('-').join(' ')
}