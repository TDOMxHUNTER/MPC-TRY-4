export class SecurityManager {
  private static instance: SecurityManager;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initSecurity();
    }
  }

  static getInstance(): SecurityManager {
    if (!SecurityManager.instance) {
      SecurityManager.instance = new SecurityManager();
    }
    return SecurityManager.instance;
  }

  private initSecurity() {
    this.preventDevTools();
    this.overrideConsole();
    this.preventRightClick();
  }

  private preventDevTools() {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
      // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
      document.addEventListener('keydown', (e) => {
        if (
          e.key === 'F12' ||
          (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
          (e.ctrlKey && e.key === 'U')
        ) {
          e.preventDefault();
          return false;
        }
      });
    }
  }

  private preventRightClick() {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
      document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        return false;
      });
    }
  }

  private showWarning() {
    if (typeof window !== 'undefined') {
      const warning = document.createElement('div');
      warning.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(255, 0, 0, 0.9);
        color: white;
        padding: 10px 15px;
        border-radius: 5px;
        z-index: 10000;
        font-family: Arial, sans-serif;
        font-size: 14px;
      `;
      warning.textContent = 'Developer tools detected!';
      document.body.appendChild(warning);

      setTimeout(() => {
        warning.remove();
      }, 5000);
    }
  }

  private overrideConsole() {
    // Only apply minimal console protection in production
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
      // Store original methods
      const originalMethods = {
        log: console.log,
        warn: console.warn,
        error: console.error,
        info: console.info
      };

      // Only override log and info in production, preserve warn and error
      console.log = () => {};
      console.info = () => {};
      // Keep warn and error for debugging
      console.warn = originalMethods.warn;
      console.error = originalMethods.error;
    }
  }

  // Input sanitization
  public sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .replace(/script/gi, '')
      .trim();
  }

  // XSS protection
  public escapeHtml(text: string): string {
    if (typeof document === 'undefined') return text;
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Rate limiting for API calls
  private requestCounts = new Map<string, { count: number; resetTime: number }>();

  public checkRateLimit(identifier: string, maxRequests = 10, windowMs = 60000): boolean {
    const now = Date.now();
    const record = this.requestCounts.get(identifier);

    if (!record || now > record.resetTime) {
      this.requestCounts.set(identifier, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (record.count >= maxRequests) {
      return false;
    }

    record.count++;
    return true;
  }

  // Clean up expired rate limit records
  public cleanupRateLimits() {
    const now = Date.now();
    for (const [key, record] of this.requestCounts.entries()) {
      if (now > record.resetTime) {
        this.requestCounts.delete(key);
      }
    }
  }

  // Add method to detect and block browser extensions
  private blockExtensions() {
    // Check for common extension patterns
    const extensionPatterns = [
      'chrome-extension://',
      'moz-extension://',
      'webkit-extension://',
      'ms-browser-extension://'
    ];
  
    // Block extension access attempts
    if (typeof window !== 'undefined'){
      const originalFetch = window.fetch;
      window.fetch = function(...args) {
        const url = args[0]?.toString() || '';
        if (extensionPatterns.some(pattern => url.includes(pattern))) {
          return Promise.reject(new Error('Extension access blocked'));
        }
        return originalFetch.apply(this, args);
      };
    }
  }
  
  // Prevent common bypass techniques
  private preventBypass() {
    // Only apply in production to prevent development issues
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
      try {
        // Prevent eval and Function constructor
        const originalEval = window.eval;
        const originalFunction = window.Function;
        
        window.eval = function() { 
          console.warn('eval() usage detected');
          return originalEval.apply(this, arguments);
        };
        
        window.Function = function() { 
          console.warn('Function constructor usage detected');
          return originalFunction.apply(this, arguments);
        };
      } catch(e) {
        // Silently handle any security setup errors
      }
    }
  }
  
  // Detect if source is being viewed
  public detectSourceViewing() {
    // Check for view-source protocol
    if (typeof window !== 'undefined'){
      if (window.location.protocol === 'view-source:') {
        window.location.href = 'about:blank';
        return;
      }
    
      // Detect if user is trying to view source through other means
      document.addEventListener('keydown', (e) => {
        // Block view source attempts
        if (e.ctrlKey && (e.key === 'u' || e.key === 'U')) {
          e.preventDefault();
          this.showSourceAccessWarning();
          return false;
        }
      });
    }
  }
  
  private showSourceAccessWarning() {
    alert('Source code viewing is restricted for this application.');
  }

  private obfuscateGlobals() {
    // Hide common debugging tools
    try {
      if (typeof window !== 'undefined'){
        delete (window as any).React;
        delete (window as any).ReactDOM;
        delete (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__;
        delete (window as any).__VUE_DEVTOOLS_GLOBAL_HOOK__;
        delete (window as any).__REDUX_DEVTOOLS_EXTENSION__;
        
        // Override toString to hide function sources
        Function.prototype.toString = function() {
          return `function ${this.name}() { [native code] }`;
        };
        
        // Block common debugging objects
        Object.defineProperty(window, 'chrome', { value: undefined, writable: false });
        Object.defineProperty(window, 'safari', { value: undefined, writable: false });
        
        // Prevent iframe injection
        if (window.top !== window.self) {
          window.top.location = window.self.location;
        }
      }
      
    } catch(e) {
      // Silently fail
    }
  }
}

// Export singleton instance
export const securityManager = SecurityManager.getInstance();

// Initialize security immediately
if (typeof window !== 'undefined') {
  SecurityManager.getInstance().obfuscateGlobals();
  SecurityManager.getInstance().blockExtensions();
  SecurityManager.getInstance().preventBypass();
  SecurityManager.getInstance().detectSourceViewing();
}