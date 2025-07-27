import { mkdir } from 'fs/promises'
import { join } from 'path'

export async function ensureUploadDirectory(): Promise<string> {
  const uploadsDir = join(process.cwd(), 'public', 'uploads', 'invoices')
  
  try {
    await mkdir(uploadsDir, { recursive: true })
    return uploadsDir
  } catch (error) {
    console.error('Error creating upload directory:', error)
    throw new Error('Failed to create upload directory')
  }
}

export function sanitizeFileName(fileName: string): string {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, '_')
}
