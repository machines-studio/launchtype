export default async file => new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.onload = e => resolve(reader.result, e)
  reader.onerror = reject
  reader.readAsText(file)
})
