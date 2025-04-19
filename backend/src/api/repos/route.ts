import { Request, Response } from 'express'

// Repository type definition
type GitHubRepo = {
  id: number
  name: string
  full_name: string
  html_url: string
  description: string | null
  default_branch: string
  stargazers_count: number
  forks_count: number
  watchers_count: number
  language: string | null
  visibility: string
  created_at: string
  updated_at: string
  owner: {
    login: string
    avatar_url: string
  }
  fork: boolean
  open_issues_count: number
  topics: string[]
  size: number
  license?: {
    name: string
    spdx_id: string
  }
}

export const GET = async (req: Request, res: Response) => {
  const { username } = req.query
  
  if (!username || typeof username !== 'string') {
    return res.status(400).json({
      error: { message: 'GitHub username is required and should be a string', code: 'BAD_REQUEST' }
    })
  }
  
  try {
    const apiUrl = `https://api.github.com/users/${username}/repos?per_page=100&sort=updated`
    
    const githubToken = process.env.GITHUB_TOKEN
    
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'GitHub-Repository-Fetcher'
    }
    
    if (githubToken) {
      headers['Authorization'] = `token ${githubToken}`
    }
    
    const response = await fetch(apiUrl, { headers })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      
      if (response.status === 404) {
        return res.status(404).json({
          error: { message: 'GitHub user not found', code: 'NOT_FOUND' }
        })
      }
      
      if (response.status === 403 && response.headers.get('x-ratelimit-remaining') === '0') {
        return res.status(429).json({
          error: { message: 'GitHub API rate limit exceeded', code: 'RATE_LIMIT_EXCEEDED' }
        })
      }
      
      return res.status(response.status).json({
        error: { 
          message: errorData.message || 'GitHub API request failed', 
          code: 'GITHUB_API_ERROR' 
        }
      })
    }
    
    const repos: GitHubRepo[] = await response.json()
    
    const formattedRepos = repos.map(repo => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      url: repo.html_url,
      description: repo.description,
      defaultBranch: repo.default_branch,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      watchers: repo.watchers_count,
      language: repo.language,
      visibility: repo.visibility,
      createdAt: repo.created_at,
      updatedAt: repo.updated_at,
      owner: {
        username: repo.owner.login,
        avatarUrl: repo.owner.avatar_url
      },
      isFork: repo.fork,
      openIssues: repo.open_issues_count,
      topics: repo.topics,
      size: repo.size,
      license: repo.license ? {
        name: repo.license.name,
        spdxId: repo.license.spdx_id
      } : null
    }))
    
    // Check for pagination (if there are more repositories)
    const linkHeader = response.headers.get('Link')
    const hasNextPage = linkHeader?.includes('rel="next"') || false
    
    return res.status(200).json({
      username,
      repositoryCount: formattedRepos.length,
      hasMoreRepositories: hasNextPage,
      repositories: formattedRepos
    })
  } catch (err) {
    console.error('Error fetching GitHub repositories:', err)
    return res.status(500).json({
      error: { message: 'Failed to fetch GitHub repositories', code: 'SERVER_ERROR' }
    })
  }
}