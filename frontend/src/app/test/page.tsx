"use client"

import { useState, useEffect } from 'react';
import { Search, GitBranch, ArrowRight, ImagePlus, Star } from 'lucide-react';
import Image from 'next/image';

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

export default function GitHubProductCreator() {
  const [repositories, setRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedRepo, setSelectedRepo] = useState<Repository>();
  const [productTitle, setProductTitle] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [images, setImages] = useState<{ id: number; url: string; alt: string; }[]>([]);
  const [username] = useState('dreadfulstep');

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
      console.log(res.data.repositories)
      setRepos(res.data.repositories);
    } catch {
      setRepos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepositories(username);
  }, [username]);

  const handleAddImage = () => {
    const newImage = {
      id: Date.now(),
      url: `/api/placeholder/400/300`,
      alt: 'Product image'
    };
    setImages([...images, newImage]);
  };

  const handleRemoveImage = (id: number) => {
    setImages(images.filter(img => img.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Product created: ${productTitle} (${selectedRepo?.name || ''}) - $${productPrice}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="border-b border-border p-4">
        <h1 className="text-2xl font-bold">GitHub Product Creator</h1>
      </header>
      
      <main className="flex-1 p-6 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-card p-6 rounded-lg border border-border">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <GitBranch className="mr-2" size={20} />
              Select Repository
            </h2>
            
            <div className="mb-6">
              <div className="flex items-center bg-secondary rounded-md pl-3 mb-1">
                <Search size={18} className="text-muted-foreground" />
                <input 
                  type="text" 
                  value={username}
                  disabled
                  className="flex-1 bg-transparent border-0 py-2 px-3 focus:outline-none text-foreground" 
                />
              </div>
            </div>
            
            {loading ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : error ? (
              <div className="p-4 bg-destructive/20 text-destructive-foreground rounded-md">
                {error}
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] flex flex-col overflow-y-auto pr-2">
                {repositories.map(repo => (
                  <button
                    key={repo.id} 
                    className={`p-4 rounded-md cursor-pointer transition-colors border ${selectedRepo?.id === repo.id ? 'bg-accent border-primary' : 'bg-secondary border-transparent hover:bg-accent'}`}
                    onClick={() => setSelectedRepo(repo)}
                  >
                    <div className="flex justify-between items-center">
                      <div className="font-bold flex items-center justify-start gap-1.5 w-full">
                        <h3>{repo.name}</h3>
                        <span className='text-muted-foreground font-medium'>·{" "}
                            {(() => {
                            const date = new Date(repo.updatedAt);
                            const now = new Date();
                            const diff = (now.getTime() - date.getTime()) / 1000;
                            
                            if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
                            if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
                            if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
                            
                            return date.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' });
                            })()}
                        </span>

                      </div>
                      <div className="flex items-center text-sm gap-2 text-muted-foreground">
                        <Star className='size-4'/>
                        {repo.stars}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 text-left">{repo.description}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="bg-card p-6 rounded-lg border border-border">
            <h2 className="text-xl font-semibold mb-4">Product Details</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Product Title</label>
                <input 
                  type="text" 
                  value={productTitle} 
                  onChange={e => setProductTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-secondary border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Enter product title"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea 
                  value={productDescription} 
                  onChange={e => setProductDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-secondary border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary min-h-32"
                  placeholder="Enter product description"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Price ($)</label>
                <input 
                  type="text" 
                  value={productPrice} 
                  onChange={e => setProductPrice(e.target.value.replace(/[^0-9.]/g, ''))}
                  className="w-full px-3 py-2 bg-secondary border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="29.99"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Product Images</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
                  {images.map(img => (
                    <div key={img.id} className="relative group">
                      <Image src={img.url} alt={img.alt} fill className="w-full h-24 object-cover rounded-md border border-border" />
                      <button 
                        type="button"
                        onClick={() => handleRemoveImage(img.id)}
                        className="absolute top-1 right-1 bg-destructive text-white w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddImage}
                    className="border-2 border-dashed border-border rounded-md flex items-center justify-center h-24 hover:bg-secondary transition-colors"
                  >
                    <ImagePlus size={24} className="text-muted-foreground" />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">Add up to 5 images</p>
              </div>
              
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={!selectedRepo || !productTitle || !productPrice}
                  className="w-full py-2.5 px-4 bg-primary text-primary-foreground rounded-md flex items-center justify-center font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Product
                  <ArrowRight size={18} className="ml-2" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}