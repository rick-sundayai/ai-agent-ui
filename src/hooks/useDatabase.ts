import { useState, useEffect } from 'react'
import { testDatabaseConnection, ConnectionTestResult, listDatabaseTables } from '@/lib/database/connection'

export interface DatabaseStatus {
  isConnected: boolean
  isLoading: boolean
  connectionResult?: ConnectionTestResult
  tables?: string[]
  error?: Error
}

export function useDatabase() {
  const [status, setStatus] = useState<DatabaseStatus>({
    isConnected: false,
    isLoading: true
  })

  const testConnection = async () => {
    setStatus(prev => ({ ...prev, isLoading: true }))
    
    try {
      const connectionResult = await testDatabaseConnection()
      
      if (connectionResult.success) {
        const tablesResult = await listDatabaseTables()
        
        setStatus({
          isConnected: true,
          isLoading: false,
          connectionResult,
          tables: tablesResult.tables,
          error: tablesResult.error
        })
      } else {
        setStatus({
          isConnected: false,
          isLoading: false,
          connectionResult,
          error: connectionResult.error
        })
      }
    } catch (error) {
      setStatus({
        isConnected: false,
        isLoading: false,
        error: error instanceof Error ? error : new Error('Unknown error')
      })
    }
  }

  useEffect(() => {
    testConnection()
  }, [])

  return {
    ...status,
    refetch: testConnection
  }
}