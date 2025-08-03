/**
 * ファイルパスを~から始まる形式に変換する
 * @param filePath ファイルパス（絶対パスまたは相対パス）
 * @returns ~から始まる相対パス
 */
export function convertToHomePath(filePath: string): string {
  // 既に~で始まっている場合はそのまま返す
  if (filePath.startsWith('~')) {
    return filePath
  }
  
  // 絶対パスの場合: /Users/username や /home/username のパターンを検出
  const userMatch = filePath.match(/^(\/Users\/[^\/]+|\/home\/[^\/]+)/)
  if (userMatch) {
    return filePath.replace(userMatch[1], '~')
  }
  
  // 相対パスの場合: ~/Documents/claude-outputs/ を前に付ける
  // APIから返される相対パス（例: "2025-08-02/test-file.md"）を処理
  if (!filePath.startsWith('/')) {
    return `~/Documents/claude-outputs/${filePath}`
  }
  
  // Node.js環境の場合のフォールバック
  if (typeof process !== 'undefined' && process.env) {
    const homeDir = process.env.HOME || process.env.USERPROFILE
    if (homeDir && filePath.startsWith(homeDir)) {
      return filePath.replace(homeDir, '~')
    }
  }
  
  // どのパターンにも一致しない場合は元のパスを返す
  return filePath
}