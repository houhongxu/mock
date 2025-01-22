import { Container } from 'shared/ReactTypes'

export function getRootHostContainer(): Container {
  const rootInstance = requiredContext(rootInstanceStackCursor.current)

  return rootInstance
}
