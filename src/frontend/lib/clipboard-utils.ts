/**
 * クリップボードにテキストをコピーするユーティリティ関数
 * モダンなClipboard APIと古いブラウザ向けのフォールバックを提供
 */
export async function copyToClipboard(text: string): Promise<void> {
  try {
    // Modern clipboard API (HTTPS required)
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text)
      return
    }
    
    // Fallback for older browsers or non-HTTPS contexts
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    textArea.style.top = '-999999px'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    
    const successful = document.execCommand('copy')
    document.body.removeChild(textArea)
    
    if (!successful) {
      throw new Error('Fallback copy operation failed')
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
    throw error
  }
}