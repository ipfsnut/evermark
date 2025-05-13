// src/utils/error-logger.ts

/**
 * Simple utility to help track errors during development
 */
class ErrorLogger {
    private errors: Array<{
      component: string;
      message: string;
      error: any;
      timestamp: Date;
      context?: any;
    }> = [];
    
    /**
     * Log an error with context
     */
    log(component: string, error: any, context?: any) {
      const errorEntry = {
        component,
        message: error?.message || String(error),
        error,
        timestamp: new Date(),
        context
      };
      
      this.errors.push(errorEntry);
      
      // Always log to console for visibility
      console.group(`[ErrorLogger] Error in ${component}`);
      console.error(error);
      if (context) console.log('Context:', context);
      console.groupEnd();
      
      return errorEntry;
    }
    
    /**
     * Get all logged errors
     */
    getAll() {
      return [...this.errors];
    }
    
    /**
     * Get errors for a specific component
     */
    getByComponent(component: string) {
      return this.errors.filter(e => e.component === component);
    }
    
    /**
     * Clear all logged errors
     */
    clear() {
      this.errors = [];
    }
    
    /**
     * Export errors as JSON for reporting
     */
    export() {
      return JSON.stringify(this.errors, null, 2);
    }
  }
  
  // Export a singleton instance
  export const errorLogger = new ErrorLogger();