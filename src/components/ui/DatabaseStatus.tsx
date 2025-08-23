import { useDatabase } from '@/hooks/useDatabase'

interface DatabaseStatusProps {
  showDetails?: boolean
}

export default function DatabaseStatus({ showDetails = false }: DatabaseStatusProps) {
  const { isConnected, isLoading, connectionResult, tables, refetch } = useDatabase()

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
        <span className="text-xs text-gray-400">Connecting...</span>
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-red-500 rounded-full" />
        <span className="text-xs text-gray-400">Disconnected</span>
        {showDetails && (
          <button
            onClick={refetch}
            className="text-xs text-[#34D399] hover:text-[#34D399]/80 transition-colors"
          >
            Retry
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <div className="w-2 h-2 bg-[#34D399] rounded-full" />
      <span className="text-xs text-gray-400">
        Connected
        {connectionResult?.latency && ` (${connectionResult.latency}ms)`}
      </span>
      {showDetails && tables && (
        <span className="text-xs text-gray-500">
          • {tables.length} tables
        </span>
      )}
    </div>
  )
}