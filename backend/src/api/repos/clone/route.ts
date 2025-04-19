import { Request, Response } from 'express'
import simpleGit from 'simple-git'
import fs from 'fs/promises'
import { existsSync, createWriteStream } from 'fs'
import path from 'path'
import archiver from 'archiver'
import os from 'os';

const REPO_DIR = path.join(os.tmpdir(), 'repos_temp')
const ZIP_DIR = path.join(process.cwd(), 'repos')

async function ensureDirectories() {
  for (const dir of [REPO_DIR, ZIP_DIR]) {
    if (!existsSync(dir)) {
      await fs.mkdir(dir, { recursive: true })
    }
  }
}

export const GET = async (req: Request, res: Response) => {
  const { repoUrl } = req.query
  
  if (!repoUrl || typeof repoUrl !== 'string') {
    return res.status(400).json({
      error: { message: 'Repository URL is required and should be a string', code: 'BAD_REQUEST' }
    })
  }
  
  try {
    await ensureDirectories()
    
    const repoName = path.basename(repoUrl, '.git')
    const tempRepoDir = path.join(REPO_DIR, `${repoName}_${Date.now()}`)
    
    const git = simpleGit()
    await git.clone(repoUrl, tempRepoDir, ['--depth', '1'])
    
    const latestCommit = await git.cwd(tempRepoDir).revparse(['HEAD'])
    const commitHash = latestCommit.trim()
    
    const zipFileName = `${commitHash}.zip`
    const zipFilePath = path.join(ZIP_DIR, zipFileName)
    
    if (existsSync(zipFilePath)) {
      await fs.rm(tempRepoDir, { recursive: true, force: true })
      
      return res.download(zipFilePath, `${repoName}.zip`, (err) => {
        if (err) {
          console.error('Error sending the file:', err)
          return res.status(500).json({
            error: { message: 'Error sending the ZIP file', code: 'SERVER_ERROR' }
          })
        }
      })
    }
    
    const output = createWriteStream(zipFilePath)
    const archive = archiver('zip', { zlib: { level: 9 } })
    
    const gitDirPath = path.join(tempRepoDir, '.git')
    if (existsSync(gitDirPath)) {
      await fs.rm(gitDirPath, { recursive: true, force: true })
    }
    
    archive.pipe(output)
    
    archive.directory(tempRepoDir, repoName)
    
    await archive.finalize()
    
    return new Promise((resolve, reject) => {
      output.on('close', async () => {
        try {
          await fs.rm(tempRepoDir, { recursive: true, force: true })
          
          res.download(zipFilePath, `${repoName}.zip`, (err) => {
            if (err) {
              console.error('Error sending the file:', err)
              reject(err)
              return res.status(500).json({
                error: { message: 'Error sending the ZIP file', code: 'SERVER_ERROR' }
              })
            }
            resolve(true)
          })
        } catch (err) {
          reject(err)
          console.error('Error during cleanup:', err)
          return res.status(500).json({
            error: { message: 'Error during cleanup', code: 'SERVER_ERROR' }
          })
        }
      })
      
      output.on('error', (err) => {
        console.error('Error creating the ZIP file:', err)
        reject(err)
        return res.status(500).json({
          error: { message: 'Error creating the ZIP file', code: 'SERVER_ERROR' }
        })
      })
    })
  } catch (err) {
    console.error('Repository operation failed:', err)
    return res.status(500).json({
      error: { message: 'Failed to process the repository', code: 'SERVER_ERROR' }
    })
  }
}