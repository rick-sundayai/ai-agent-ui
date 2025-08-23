'use client'

import { useState, useEffect } from 'react'
import { listDatabaseTables, getTableSchema } from '@/lib/database/connection'
import { createClient } from '@/lib/supabase/client'

interface ColumnInfo {
  column_name: string
  data_type: string
  is_nullable: string
}

interface TableInfo {
  name: string
  columns: ColumnInfo[]
  sampleData: Record<string, unknown>[]
}

export default function DatabaseExplorer() {
  const [tables, setTables] = useState<string[]>([])
  const [selectedTable, setSelectedTable] = useState<string>('')
  const [tableInfo, setTableInfo] = useState<TableInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    loadTables()
  }, [])

  const loadTables = async () => {
    try {
      const result = await listDatabaseTables()
      if (result.success) {
        setTables(result.tables || [])
        if (result.tables && result.tables.length > 0) {
          setSelectedTable(result.tables[0])
        }
      } else {
        setError(result.error?.message || 'Failed to load tables')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (selectedTable) {
      loadTableInfo(selectedTable)
    }
  }, [selectedTable])

  const loadTableInfo = async (tableName: string) => {
    try {
      const schemaResult = await getTableSchema(tableName)
      if (!schemaResult.success) {
        setError(schemaResult.error?.message || 'Failed to load schema')
        return
      }

      // Get sample data
      const supabase = createClient()
      const { data: sampleData, error: dataError } = await supabase
        .from(tableName)
        .select('*')
        .limit(5)

      // Don't treat empty tables as errors, just show no data
      if (dataError) {
        // Check if it's a permission error vs table not found
        const isPermissionError = dataError.message.includes('permission') || 
                                dataError.message.includes('access') ||
                                dataError.message.includes('denied')
        
        const isTableNotFound = dataError.message.includes('does not exist') ||
                               dataError.message.includes('relation') && dataError.message.includes('does not exist')
        
        let errorMessage = `Failed to load data from table '${tableName}': `
        
        if (isPermissionError) {
          errorMessage += 'Permission denied. Check your Row Level Security (RLS) policies.'
        } else if (isTableNotFound) {
          errorMessage += 'Table not found or not accessible.'
        } else {
          errorMessage += dataError.message
        }
        
        setError(errorMessage)
        
        // Still show schema info even if we can't load data
        setTableInfo({
          name: tableName,
          columns: schemaResult.columns || [],
          sampleData: []
        })
        return
      }

      setTableInfo({
        name: tableName,
        columns: schemaResult.columns || [],
        sampleData: sampleData || []
      })
      
      // Clear any previous errors if successful
      setError('')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(`Error loading table info for '${tableName}': ${errorMessage}`)
    }
  }

  if (loading) {
    return (
      <div className="p-6 bg-[#2D3748] rounded-lg border border-[#4A5568]">
        <div className="animate-pulse">
          <div className="h-4 bg-[#4A5568] rounded w-1/4 mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-[#4A5568] rounded w-3/4"></div>
            <div className="h-3 bg-[#4A5568] rounded w-1/2"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 bg-[#2D3748] rounded-lg border border-red-500/20">
        <h3 className="text-red-400 font-semibold mb-2">Database Error</h3>
        <p className="text-red-300 text-sm">{error}</p>
        <button 
          onClick={loadTables}
          className="mt-3 px-3 py-1 bg-red-500/20 text-red-300 rounded hover:bg-red-500/30 transition-colors text-sm"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-[#2D3748] rounded-lg border border-[#4A5568] p-6">
        <h3 className="text-lg font-semibold mb-4">Database Explorer</h3>
        
        {tables.length === 0 ? (
          <p className="text-gray-400">No tables found in database</p>
        ) : (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Select Table:</label>
              <select
                value={selectedTable}
                onChange={(e) => setSelectedTable(e.target.value)}
                className="bg-[#191D24] border border-[#4A5568] rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#34D399]"
              >
                {tables.map(table => (
                  <option key={table} value={table}>{table}</option>
                ))}
              </select>
            </div>

            {tableInfo && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Schema for `{tableInfo.name}`</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[#4A5568]">
                          <th className="text-left p-2">Column</th>
                          <th className="text-left p-2">Type</th>
                          <th className="text-left p-2">Nullable</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tableInfo.columns.map((col, idx) => (
                          <tr key={idx} className="border-b border-[#4A5568]/30">
                            <td className="p-2 font-mono text-[#34D399]">{col.column_name}</td>
                            <td className="p-2 text-gray-300">{col.data_type}</td>
                            <td className="p-2 text-gray-400">{col.is_nullable}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Sample Data ({tableInfo.sampleData.length} rows)</h4>
                  {tableInfo.sampleData.length === 0 ? (
                    <p className="text-gray-400 text-sm">No data in table{error ? ' (see error above)' : ''}</p>
                  ) : (
                    <div className="bg-[#191D24] rounded p-3 overflow-x-auto">
                      <pre className="text-sm text-gray-300">
                        {JSON.stringify(tableInfo.sampleData, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}