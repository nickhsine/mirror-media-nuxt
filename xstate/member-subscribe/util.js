import { State } from 'xstate'
import { ENV } from '~/configs/config'

export function isMemberSubscribeFeatureToggled(route) {
  const _route = route.value ?? route
  return (ENV === 'local' || ENV === 'dev') && Boolean(_route.query.ms)
}

const storageKey = 'member-subscribe-state'
export function persistStorageState(state) {
  const jsonState = JSON.stringify(state)

  // Example: persisting to sessionStorage
  try {
    sessionStorage.setItem(storageKey, jsonState)
  } catch (e) {
    // unable to save to sessionStorage
  }
}
export function removeStorageState() {
  sessionStorage.removeItem(storageKey)
}
export function createResolvedState(machineInstance) {
  // Retrieving the state definition from localStorage, if localStorage is empty use machine initial state
  const stateStorage = JSON.parse(sessionStorage.getItem(storageKey))
  if (stateStorage) {
    removeStorageState()
  }

  const stateDefinition = stateStorage || machineInstance.initialState

  // Use State.create() to restore state from a plain object
  const previousState = State.create(stateDefinition)

  // Use machine.resolveState() to resolve the state definition to a new State instance relative to the machine
  const resolvedState = machineInstance.resolveState(previousState)
  return resolvedState
}
