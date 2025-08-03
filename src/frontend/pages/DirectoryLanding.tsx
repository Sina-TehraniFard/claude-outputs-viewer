import { Folder } from 'lucide-react'

export function DirectoryLanding() {
  return (
    <div className="flex items-center justify-center h-[calc(100vh-200px)]">
      <div className="text-center">
        <Folder className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-semibold mb-2">ディレクトリを選択してください</h2>
        <p className="text-muted-foreground">
          左側のディレクトリ一覧から日付を選択すると、<br />
          そのディレクトリ内のファイルが表示されます
        </p>
      </div>
    </div>
  )
}