export default (path = '') => {
  if (typeof path !== 'string') return null

  // Normalize slashes and remove trailing slash (if not root)
  const normalizedPath = path.replace(/\\/g, '/').replace(/\/+$/, '')

  // Find the last slash in the normalized path
  const lastSlashIndex = normalizedPath.lastIndexOf('/')

  if (lastSlashIndex === -1) return '.' // No directory part
  if (lastSlashIndex === 0) return '/'  // Root directory
  return normalizedPath.substring(0, lastSlashIndex)
}
