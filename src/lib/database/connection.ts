import { createClient } from '../supabase/client'

export interface ConnectionTestResult {
  success: boolean
  message: string
  error?: Error
  latency?: number
}

export async function testDatabaseConnection(): Promise<ConnectionTestResult> {
  const startTime = Date.now()
  
  try {
    const supabase = createClient()
    
    // Simple connection test - just check if we can connect to Supabase
    const { error } = await supabase.auth.getSession()
    
    const latency = Date.now() - startTime
    
    if (error && error.message !== 'Auth session missing!') {
      return {
        success: false,
        message: `Database connection failed: ${error.message}`,
        error,
        latency
      }
    }
    
    return {
      success: true,
      message: 'Database connection successful',
      latency
    }
  } catch (error) {
    const latency = Date.now() - startTime
    return {
      success: false,
      message: `Database connection error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error: error instanceof Error ? error : new Error('Unknown error'),
      latency
    }
  }
}

export async function listDatabaseTables(): Promise<{ success: boolean; tables?: string[]; error?: Error }> {
  try {
    const supabase = createClient()
    
    // Use PostgreSQL information_schema to get actual table names
    // This queries the system tables to find all tables in the public schema
    const { data, error } = await supabase.rpc('get_public_tables')
    
    if (error) {
      // Fallback: If RPC doesn't exist, try direct query to information_schema
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .eq('table_type', 'BASE TABLE')
      
      if (fallbackError) {
        // Final fallback: Test common table names if system queries fail
        return await fallbackTableDiscovery()
      }
      
      const tables = fallbackData?.map((row: { table_name: string }) => row.table_name) || []
      return {
        success: true,
        tables: tables.filter(name => !name.startsWith('_')) // Filter out system tables
      }
    }
    
    return {
      success: true,
      tables: data || []
    }
  } catch {
    // If all else fails, use the original hardcoded approach
    return await fallbackTableDiscovery()
  }
}

// Fallback function for when system queries don't work
async function fallbackTableDiscovery(): Promise<{ success: boolean; tables?: string[]; error?: Error }> {
  try {
    const supabase = createClient()
    
    // Extended list of common table names to test
    const potentialTables = [
      'users', 'profiles', 'sessions', 'messages', 'conversations', 'chat_sessions',
      'agent_activities', 'user_profiles', 'chat_messages', 'workspaces',
      'projects', 'tasks', 'files', 'uploads', 'settings', 'logs', 'events',
      'notifications', 'auth', 'organizations', 'teams', 'roles', 'permissions'
    ]
    
    const existingTables: string[] = []
    
    // Test each potential table by trying a simple select
    for (const tableName of potentialTables) {
      try {
        const { error } = await supabase
          .from(tableName)
          .select('id')
          .limit(1)
        
        if (!error) {
          existingTables.push(tableName)
        }
      } catch {
        // Table doesn't exist, skip it
      }
    }
    
    return {
      success: true,
      tables: existingTables
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error('Unknown error')
    }
  }
}

interface ColumnInfo {
  column_name: string
  data_type: string
  is_nullable: string
}

export async function getTableSchema(tableName: string): Promise<{ success: boolean; columns?: ColumnInfo[]; error?: Error }> {
  try {
    const supabase = createClient()
    
    // First, try to get proper schema information from information_schema
    const { data: schemaData, error: schemaError } = await supabase.rpc('get_table_schema', { 
      table_name: tableName 
    })
    
    if (!schemaError && schemaData && schemaData.length > 0) {
      return {
        success: true,
        columns: schemaData.map((col: { column_name: string; data_type: string; is_nullable: string }) => ({
          column_name: col.column_name,
          data_type: col.data_type,
          is_nullable: col.is_nullable
        }))
      }
    }
    
    // Fallback: Try direct query to information_schema.columns
    const { data: fallbackSchemaData, error: fallbackSchemaError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', tableName)
      .eq('table_schema', 'public')
      .order('ordinal_position')
    
    if (!fallbackSchemaError && fallbackSchemaData && fallbackSchemaData.length > 0) {
      return {
        success: true,
        columns: fallbackSchemaData.map((col: { column_name: string; data_type: string; is_nullable: string }) => ({
          column_name: col.column_name,
          data_type: col.data_type,
          is_nullable: col.is_nullable
        }))
      }
    }
    
    // Final fallback: Infer schema from sample data
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1)
    
    if (error) {
      return {
        success: false,
        error: new Error(`Cannot access table '${tableName}': ${error.message}`)
      }
    }
    
    // If we have data, infer columns from the structure
    if (data && data.length > 0) {
      const sampleRow = data[0]
      const columns: ColumnInfo[] = Object.keys(sampleRow).map(key => {
        const value = sampleRow[key]
        let dataType = typeof value
        
        // Better type inference
        if (value === null) {
          dataType = 'object' // null is technically an object in JavaScript
        } else if (Array.isArray(value)) {
          dataType = 'object' // Arrays are objects
        } else if (value instanceof Date) {
          dataType = 'object' // Dates are objects
        } else if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
          dataType = 'string' // Keep as string but could be timestamp
        }
        
        return {
          column_name: key,
          data_type: dataType,
          is_nullable: value === null ? 'YES' : 'UNKNOWN'
        }
      })
      
      return {
        success: true,
        columns
      }
    }
    
    // If no data and no schema info, check if table exists but is empty
    const { error: existsError } = await supabase
      .from(tableName)
      .select('*')
      .limit(0)
    
    if (existsError) {
      return {
        success: false,
        error: new Error(`Table '${tableName}' does not exist or is not accessible: ${existsError.message}`)
      }
    }
    
    // Table exists but is empty and we can't get schema
    return {
      success: true,
      columns: [],
      error: new Error(`Table '${tableName}' exists but is empty and schema cannot be determined`)
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error('Unknown error')
    }
  }
}