/**
 * @typedef {'connection_request' | 'connection_accepted'} NotificationType
 *
 * @typedef {object} AppNotification
 * @property {string} id
 * @property {string} name
 * @property {string} fromUid
 * @property {string|null} photoURL
 * @property {string} status
 * @property {NotificationType} type
 */

/** @returns {AppNotification} */
export function createConnectionRequestNotification({
  id,
  name,
  fromUid = id,
  photoURL = null,
  status = 'pending',
}) {
  return {
    id,
    name,
    fromUid,
    photoURL,
    status,
    type: 'connection_request',
  }
}

/** @returns {AppNotification} */
export function createConnectionAcceptedNotification({
  id,
  name,
  fromUid = id,
  photoURL = null,
  status = 'unread',
}) {
  return {
    id,
    name,
    fromUid,
    photoURL,
    status,
    type: 'connection_accepted',
  }
}

/** @type {AppNotification[]} */
export const CONNECTION_REQUEST_NOTIFICATIONS = []
