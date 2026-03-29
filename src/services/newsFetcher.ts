/**
 * REAL-TIME NEWS FETCHING SYSTEM
 * This service handles fetching live news from the backend API
 * with auto-refresh and retry logic.
 */

import { NewsArticle } from '../types';

class NewsFetcher {
  private intervalId: number | null = null;
  private subscribers: ((news: NewsArticle[]) => void)[] = [];
  private errorSubscribers: ((error: string) => void)[] = [];

  constructor(private refreshIntervalMs: number = 120000) {} // Default 2 minutes

  public async fetchNews(): Promise<NewsArticle[]> {
    console.log("Fetching news...");
    try {
      const response = await fetch("/api/news");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log("News fetched successfully");
      this.notifySubscribers(data);
      return data;
    } catch (error) {
      console.error("Error fetching news:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      this.notifyErrorSubscribers(errorMessage);
      throw error;
    }
  }

  public startAutoRefresh() {
    if (this.intervalId) return;
    
    // Initial fetch
    this.fetchNews().catch(() => {});

    this.intervalId = window.setInterval(() => {
      this.fetchNews().catch(() => {});
    }, this.refreshIntervalMs);
  }

  public stopAutoRefresh() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  public subscribe(callback: (news: NewsArticle[]) => void) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(s => s !== callback);
    };
  }

  public onError(callback: (error: string) => void) {
    this.errorSubscribers.push(callback);
    return () => {
      this.errorSubscribers = this.errorSubscribers.filter(s => s !== callback);
    };
  }

  private notifySubscribers(news: NewsArticle[]) {
    this.subscribers.forEach(s => s(news));
  }

  private notifyErrorSubscribers(error: string) {
    this.errorSubscribers.forEach(s => s(error));
  }
}

export const newsFetcher = new NewsFetcher();
