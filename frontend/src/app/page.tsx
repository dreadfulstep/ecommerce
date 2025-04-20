"use client";

import { useState } from 'react';
import { Search, Star, GitFork, Code, Eye, Calendar, AlertCircle, ExternalLink, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

type RepoOwner = {
  username: string;
  avatarUrl: string;
};

type RepoLicense = {
  name: string;
  spdxId: string;
} | null;

type Repository = {
  id: number;
  name: string;
  fullName: string;
  url: string;
  description: string | null;
  defaultBranch: string;
  stars: number;
  forks: number;
  watchers: number;
  language: string | null;
  visibility: string;
  createdAt: string;
  updatedAt: string;
  owner: RepoOwner;
  isFork: boolean;
  openIssues: number;
  topics: string[];
  size: number;
  license: RepoLicense;
};

type GitHubResponse = {
  username: string;
  repositoryCount: number;
  hasMoreRepositories: boolean;
  repositories: Repository[];
};

export default function GitHubExplorer() {
  const [username, setUsername] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [repos, setRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalRepos, setTotalRepos] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const fetchRepositories = async (username: string) => {
    if (!username.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`http://localhost:5050/repos?username=${username}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to fetch repositories');
      }
      
      const res: { data: GitHubResponse } = await response.json();

      setRepos(res.data.repositories);
      setTotalRepos(res.data.repositoryCount);
      setHasMore(res.data.hasMoreRepositories);
      setUsername(res.data.username);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setRepos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRepositories(searchInput);
  };

  const getLanguageColor = (language: string | null) => {
    const colors: Record<string, string> = {
      JavaScript: '#f1e05a',
      TypeScript: '#3178c6',
      Python: '#3572A5',
      Java: '#b07219',
      Go: '#00ADD8',
      Rust: '#dea584',
      Ruby: '#701516',
      PHP: '#4F5D95',
      CSS: '#563d7c',
      HTML: '#e34c26',
    };
    
    return language && colors[language] ? colors[language] : '#8b949e';
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            GitHub Repository Explorer
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Search for a GitHub username to see their repositories with detailed information.
          </p>
        </div>
        
        <div className="max-w-xl mx-auto mb-10">
          <form onSubmit={handleSearch} className="flex w-full">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Enter GitHub username"
                className="block w-full pl-10 pr-3 py-3 border rounded-l-md bg-gray-800 border-gray-700 text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !searchInput.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-r-md border border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                'Search'
              )}
            </button>
          </form>
        </div>

        {error && (
          <div className="bg-red-900/20 border-l-4 border-red-500 p-4 mb-8 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            </div>
          </div>
        )}

        {username && !loading && !error && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-200">
              Found {totalRepos} repositories for <span className="text-blue-600">{username}</span>
              {hasMore && ' (showing first 100)'}
            </h2>
          </div>
        )}

        {loading && (
          <div className="flex justify-center my-20">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {repos.map((repo) => (
            <div
              key={repo.id}
              className="bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-700 hover:shadow-lg transition-shadow duration-300"
            >
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-white truncate">
                    {repo.name}
                  </h3>
                  <a
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-blue-400"
                    aria-label="Open repository"
                  >
                    <ExternalLink className="h-5 w-5" />
                  </a>
                </div>
                
                <p className="text-gray-300 text-sm mb-4 line-clamp-2 h-10">
                  {repo.description || 'No description provided'}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {repo.topics.slice(0, 3).map((topic) => (
                    <span
                      key={topic}
                      className="px-2 py-1 text-xs font-medium bg-blue-900 text-blue-200 rounded-full"
                    >
                      {topic}
                    </span>
                  ))}
                  {repo.topics.length > 3 && (
                    <span className="px-2 py-1 text-xs font-medium bg-gray-700 text-gray-300 rounded-full">
                      +{repo.topics.length - 3} more
                    </span>
                  )}
                </div>
                
                <div className="mb-4">
                  {repo.language && (
                    <div className="flex items-center text-sm">
                      <span 
                        className="w-3 h-3 rounded-full mr-1" 
                        style={{ backgroundColor: getLanguageColor(repo.language) }}
                      ></span>
                      <span className="text-gray-300">{repo.language}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center text-sm text-gray-400 space-x-4">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 mr-1" />
                    <span>{formatNumber(repo.stars)}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <GitFork className="h-4 w-4 mr-1" />
                    <span>{formatNumber(repo.forks)}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Eye className="h-4 w-4 mr-1" />
                    <span>{formatNumber(repo.watchers)}</span>
                  </div>
                </div>
              </div>
              
              <div className="px-5 py-3 bg-gray-850 text-xs text-gray-400 border-t border-gray-700 flex justify-between">
                <div className="flex items-center">
                  <Code className="h-3.5 w-3.5 mr-1" />
                  <span>{repo.defaultBranch}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-3.5 w-3.5 mr-1" />
                  <span>Updated {format(new Date(repo.updatedAt), 'MMM d, yyyy')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {repos.length > 0 && hasMore && (
          <div className="text-center mt-8">
            <p className="text-gray-400">
              Showing first 100 repositories. Visit GitHub for more.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}