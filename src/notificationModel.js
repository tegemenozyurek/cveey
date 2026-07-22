/**
 * Connection-request notification card shape.
 * @typedef {object} ConnectionRequestNotification
 * @property {string} id
 * @property {string} name
 * @property {string} fromUid
 * @property {string|null} photoURL
 * @property {'pending'} status
 */

/** @returns {ConnectionRequestNotification} */
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
  }
}

/** @type {ConnectionRequestNotification[]} */
export const CONNECTION_REQUEST_NOTIFICATIONS = []
