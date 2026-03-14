/**
 * LoadingSpinner — shown while auth state or data is loading.
 * message: optional Chinese or English text to display below the spinner
 */
export default function LoadingSpinner({ message = '加载中...' }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
      <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      <p className="text-gray-500 text-sm" lang="zh-CN">{message}</p>
    </div>
  )
}
