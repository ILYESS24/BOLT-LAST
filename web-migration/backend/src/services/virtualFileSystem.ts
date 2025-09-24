import { db } from '../database/connection';
import { virtualFiles } from '../database/schema';
import { eq, and } from 'drizzle-orm';
import path from 'path';
import { z } from 'zod';

// Schémas de validation
const _fileContentSchema = z.object({
  path: z.string().min(1),
  content: z.string(),
});

const _fileOperationSchema = z.object({
  from: z.string().min(1),
  to: z.string().min(1),
});

export class VirtualFileSystem {
  private appId: string;

  constructor(appId: string) {
    this.appId = appId;
  }

  // Lire un fichier
  async readFile(filePath: string): Promise<string | null> {
    try {
      const normalizedPath = this.normalizePath(filePath);
      
      const file = await db
        .select()
        .from(virtualFiles)
        .where(and(
          eq(virtualFiles.appId, this.appId),
          eq(virtualFiles.path, normalizedPath)
        ))
        .limit(1);

      return file.length > 0 ? file[0].content : null;
    } catch (error) {
      console.error('Error reading file:', error);
      throw new Error(`Failed to read file: ${filePath}`);
    }
  }

  // Écrire un fichier
  async writeFile(filePath: string, content: string): Promise<void> {
    try {
      const normalizedPath = this.normalizePath(filePath);
      const size = Buffer.byteLength(content, 'utf8');

      // Vérifier si le fichier existe déjà
      const existingFile = await db
        .select()
        .from(virtualFiles)
        .where(and(
          eq(virtualFiles.appId, this.appId),
          eq(virtualFiles.path, normalizedPath)
        ))
        .limit(1);

      if (existingFile.length > 0) {
        // Mettre à jour le fichier existant
        await db
          .update(virtualFiles)
          .set({
            content,
            size,
            updatedAt: new Date(),
          })
          .where(eq(virtualFiles.id, existingFile[0].id));
      } else {
        // Créer un nouveau fichier
        const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        await db.insert(virtualFiles).values({
          id: fileId,
          appId: this.appId,
          path: normalizedPath,
          content,
          size,
        });
      }
    } catch (error) {
      console.error('Error writing file:', error);
      throw new Error(`Failed to write file: ${filePath}`);
    }
  }

  // Supprimer un fichier
  async deleteFile(filePath: string): Promise<void> {
    try {
      const normalizedPath = this.normalizePath(filePath);
      
      await db
        .delete(virtualFiles)
        .where(and(
          eq(virtualFiles.appId, this.appId),
          eq(virtualFiles.path, normalizedPath)
        ));
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new Error(`Failed to delete file: ${filePath}`);
    }
  }

  // Renommer un fichier
  async renameFile(fromPath: string, toPath: string): Promise<void> {
    try {
      const normalizedFromPath = this.normalizePath(fromPath);
      const normalizedToPath = this.normalizePath(toPath);

      // Vérifier que le fichier source existe
      const sourceFile = await db
        .select()
        .from(virtualFiles)
        .where(and(
          eq(virtualFiles.appId, this.appId),
          eq(virtualFiles.path, normalizedFromPath)
        ))
        .limit(1);

      if (sourceFile.length === 0) {
        throw new Error(`Source file not found: ${fromPath}`);
      }

      // Vérifier que le fichier de destination n'existe pas déjà
      const destFile = await db
        .select()
        .from(virtualFiles)
        .where(and(
          eq(virtualFiles.appId, this.appId),
          eq(virtualFiles.path, normalizedToPath)
        ))
        .limit(1);

      if (destFile.length > 0) {
        throw new Error(`Destination file already exists: ${toPath}`);
      }

      // Mettre à jour le chemin du fichier
      await db
        .update(virtualFiles)
        .set({
          path: normalizedToPath,
          updatedAt: new Date(),
        })
        .where(eq(virtualFiles.id, sourceFile[0].id));
    } catch (error) {
      console.error('Error renaming file:', error);
      throw new Error(`Failed to rename file from ${fromPath} to ${toPath}`);
    }
  }

  // Lister tous les fichiers d'une application
  async listFiles(): Promise<Array<{ path: string; size: number; updatedAt: Date }>> {
    try {
      const files = await db
        .select({
          path: virtualFiles.path,
          size: virtualFiles.size,
          updatedAt: virtualFiles.updatedAt,
        })
        .from(virtualFiles)
        .where(eq(virtualFiles.appId, this.appId))
        .orderBy(virtualFiles.path);

      return files;
    } catch (error) {
      console.error('Error listing files:', error);
      throw new Error('Failed to list files');
    }
  }

  // Créer un répertoire (en créant un fichier .gitkeep)
  async createDirectory(dirPath: string): Promise<void> {
    const gitkeepPath = path.posix.join(this.normalizePath(dirPath), '.gitkeep');
    await this.writeFile(gitkeepPath, '');
  }

  // Vérifier si un fichier existe
  async fileExists(filePath: string): Promise<boolean> {
    try {
      const normalizedPath = this.normalizePath(filePath);
      
      const file = await db
        .select()
        .from(virtualFiles)
        .where(and(
          eq(virtualFiles.appId, this.appId),
          eq(virtualFiles.path, normalizedPath)
        ))
        .limit(1);

      return file.length > 0;
    } catch (error) {
      console.error('Error checking file existence:', error);
      return false;
    }
  }

  // Obtenir les statistiques d'un fichier
  async getFileStats(filePath: string): Promise<{ size: number; updatedAt: Date } | null> {
    try {
      const normalizedPath = this.normalizePath(filePath);
      
      const file = await db
        .select({
          size: virtualFiles.size,
          updatedAt: virtualFiles.updatedAt,
        })
        .from(virtualFiles)
        .where(and(
          eq(virtualFiles.appId, this.appId),
          eq(virtualFiles.path, normalizedPath)
        ))
        .limit(1);

      return file.length > 0 ? file[0] : null;
    } catch (error) {
      console.error('Error getting file stats:', error);
      return null;
    }
  }

  // Normaliser un chemin de fichier
  private normalizePath(filePath: string): string {
    // Supprimer les chemins relatifs dangereux
    const normalized = path.posix.normalize(filePath);
    
    // S'assurer que le chemin commence par /
    if (!normalized.startsWith('/')) {
      return '/' + normalized;
    }
    
    return normalized;
  }

  // Exporter tous les fichiers sous forme d'archive
  async exportFiles(): Promise<Record<string, string>> {
    try {
      const files = await db
        .select()
        .from(virtualFiles)
        .where(eq(virtualFiles.appId, this.appId));

      const fileMap: Record<string, string> = {};
      
      for (const file of files) {
        fileMap[file.path] = file.content;
      }

      return fileMap;
    } catch (error) {
      console.error('Error exporting files:', error);
      throw new Error('Failed to export files');
    }
  }

  // Importer des fichiers depuis une archive
  async importFiles(fileMap: Record<string, string>): Promise<void> {
    try {
      // Supprimer tous les fichiers existants
      await db
        .delete(virtualFiles)
        .where(eq(virtualFiles.appId, this.appId));

      // Créer les nouveaux fichiers
      const filesToInsert = Object.entries(fileMap).map(([filePath, content]) => ({
        id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        appId: this.appId,
        path: this.normalizePath(filePath),
        content,
        size: Buffer.byteLength(content, 'utf8'),
      }));

      if (filesToInsert.length > 0) {
        await db.insert(virtualFiles).values(filesToInsert);
      }
    } catch (error) {
      console.error('Error importing files:', error);
      throw new Error('Failed to import files');
    }
  }
}
