export const useImage = async () => {
  const { data: image, status } = await useFetch('/api/ai/image', {
    method: 'POST',
  })

  const download = () => {
    if (!image.value || image.value.type !== 'image' || !image.value.data) {
      return
    }

    const byteCharacters = atob(image.value.data)
    const byteNumbers = new Array(byteCharacters.length)
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    const byteArray = new Uint8Array(byteNumbers)
    const blob = new Blob([byteArray], { type: image.value.mimeType })

    const now = new Date()
    const yyyy = now.getFullYear()
    const mm = String(now.getMonth() + 1).padStart(2, '0')
    const dd = String(now.getDate()).padStart(2, '0')
    const hh = String(now.getHours()).padStart(2, '0')
    const mi = String(now.getMinutes()).padStart(2, '0')
    const ss = String(now.getSeconds()).padStart(2, '0')

    const filename = `gemini-image-${yyyy}${mm}${dd}-${hh}${mi}${ss}.png`

    // ダウンロード処理
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = filename
    link.click()
    URL.revokeObjectURL(link.href)
  }

  return { image, status, download }
}
