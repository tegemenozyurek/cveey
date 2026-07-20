let pendingCvFile = null

export function setPendingCvFile(file) {
  pendingCvFile = file || null
}

export function takePendingCvFile() {
  const file = pendingCvFile
  pendingCvFile = null
  return file
}

export function hasPendingCvFile() {
  return pendingCvFile != null
}
