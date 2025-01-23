import { DOMEventName } from 'shared/ReactTypes'

const allNativeEvents = new Set(['onClick'])
const nonDelegatedEvents = new Set([
  'cancel',
  'close',
  'invalid',
  'load',
  'scroll',
  'toggle',
])

const listeningMarker = '_reactListening' + Math.random().toString(36).slice(2)

function addTrappedEventListener(
  targetContainer: EventTarget,
  domEventName: DOMEventName,
  isCapturePhaseListener: boolean,
  isDeferredListenerForLegacyFBSupport?: boolean,
) {}

export function listenToNativeEvent(
  domEventName: DOMEventName,
  isCapturePhaseListener: boolean,
  target: EventTarget,
) {
  addTrappedEventListener(target, domEventName, isCapturePhaseListener)
}

export function listenToAllSupportedEvents(
  rootContainerElement: EventTarget & Record<string, boolean>,
) {
  if (!rootContainerElement[listeningMarker]) {
    rootContainerElement[listeningMarker] = true

    allNativeEvents.forEach((domEventName) => {
      if (domEventName !== 'selectionchange') {
        if (!nonDelegatedEvents.has(domEventName)) {
          listenToNativeEvent(domEventName, false, rootContainerElement)
        }

        listenToNativeEvent(domEventName, true, rootContainerElement)
      }
    })

    const ownerDocument = rootContainerElement

    if (ownerDocument !== null) {
      if (!ownerDocument[listeningMarker]) {
        ownerDocument[listeningMarker] = true

        listenToNativeEvent('selectionchange', false, ownerDocument)
      }
    }
  }
}
