export class RateLimiter {
    private static instance: RateLimiter;
    private requests: { timestamp: number }[] = [];
    private maxRequests = 10;
    private timeWindow = 60000; // 1 minute
    private isLocked = false;
  
    private constructor() {}
  
    public static getInstance(): RateLimiter {
      if (!RateLimiter.instance) {
        RateLimiter.instance = new RateLimiter();
      }
      return RateLimiter.instance;
    }
  
    public async canMakeRequest(): Promise<boolean> {
      if (this.isLocked) return false;
      
      const now = Date.now();
      this.cleanup(now);
      
      if (this.requests.length >= this.maxRequests) {
        return false;
      }
  
      this.isLocked = true;
      this.requests.push({ timestamp: now });
      
      // Release lock after 1 second
      setTimeout(() => {
        this.isLocked = false;
      }, 1000);
  
      return true;
    }
  
    private cleanup(now: number): void {
      const cutoff = now - this.timeWindow;
      this.requests = this.requests.filter(req => req.timestamp > cutoff);
    }
  
    public getTimeUntilNext(): number {
      if (this.requests.length === 0) return 0;
      const oldestTimestamp = this.requests[0].timestamp;
      return Math.max(0, this.timeWindow - (Date.now() - oldestTimestamp));
    }
  }