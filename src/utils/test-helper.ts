// src/utils/test-helper.ts
import { errorLogger } from './error-logger';

/**
 * Helper utility for systematic testing of the application
 */
export class TestHelper {
  private static instance: TestHelper;
  private testSessions: Array<{
    id: string;
    path: string;
    component: string;
    startTime: Date;
    endTime?: Date;
    errors: any[];
    notes: string[];
  }> = [];
  
  private currentSession: string | null = null;

  private constructor() {}

  /**
   * Get the singleton instance
   */
  public static getInstance(): TestHelper {
    if (!TestHelper.instance) {
      TestHelper.instance = new TestHelper();
    }
    return TestHelper.instance;
  }

  /**
   * Start a new test session
   */
  public startSession(path: string, component: string): string {
    const id = `test-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    this.testSessions.push({
      id,
      path,
      component,
      startTime: new Date(),
      errors: [],
      notes: []
    });
    this.currentSession = id;
    
    console.log(`[TestHelper] Started test session for ${component} at ${path}`);
    return id;
  }

  /**
   * End the current test session
   */
  public endSession(id?: string): void {
    const sessionId = id || this.currentSession;
    if (!sessionId) {
      console.warn('[TestHelper] No active test session to end');
      return;
    }

    const sessionIndex = this.testSessions.findIndex(s => s.id === sessionId);
    if (sessionIndex === -1) {
      console.warn(`[TestHelper] Test session ${sessionId} not found`);
      return;
    }

    // Get all errors from the error logger
    const errors = errorLogger.getAll();
    this.testSessions[sessionIndex].errors = errors;
    this.testSessions[sessionIndex].endTime = new Date();

    if (this.currentSession === sessionId) {
      this.currentSession = null;
    }

    console.log(`[TestHelper] Ended test session ${sessionId} with ${errors.length} errors`);
  }

  /**
   * Add a note to the current test session
   */
  public addNote(note: string, id?: string): void {
    const sessionId = id || this.currentSession;
    if (!sessionId) {
      console.warn('[TestHelper] No active test session to add note to');
      return;
    }

    const sessionIndex = this.testSessions.findIndex(s => s.id === sessionId);
    if (sessionIndex === -1) {
      console.warn(`[TestHelper] Test session ${sessionId} not found`);
      return;
    }

    this.testSessions[sessionIndex].notes.push(note);
  }

  /**
   * Get a summary of all test sessions
   */
  public getSummary(): any {
    return this.testSessions.map(session => ({
      id: session.id,
      path: session.path,
      component: session.component,
      startTime: session.startTime,
      endTime: session.endTime,
      duration: session.endTime 
        ? (session.endTime.getTime() - session.startTime.getTime()) / 1000
        : null,
      errorCount: session.errors.length,
      notes: session.notes
    }));
  }

  /**
   * Get the details of a specific test session
   */
  public getSessionDetails(id: string): any {
    const session = this.testSessions.find(s => s.id === id);
    if (!session) {
      console.warn(`[TestHelper] Test session ${id} not found`);
      return null;
    }

    return {
      ...session,
      duration: session.endTime 
        ? (session.endTime.getTime() - session.startTime.getTime()) / 1000
        : null
    };
  }

  /**
   * Generate a report for testing
   */
  public generateReport(): string {
    return `# Evermark Testing Report
${new Date().toLocaleString()}

## Summary
${this.testSessions.length} test sessions conducted

${this.testSessions.map(session => `
### ${session.component} (${session.path})
- Started: ${session.startTime.toLocaleString()}
- Duration: ${session.endTime 
  ? `${((session.endTime.getTime() - session.startTime.getTime()) / 1000).toFixed(2)}s` 
  : 'Not completed'}
- Errors: ${session.errors.length}
- Notes: ${session.notes.length > 0 ? '\n  - ' + session.notes.join('\n  - ') : 'None'}

${session.errors.length > 0 ? `**Errors:**
${session.errors.map((error, i) => `
${i+1}. **${error.component}**: ${error.message}
   - Timestamp: ${error.timestamp.toLocaleString()}
`).join('')}` : ''}
`).join('')}
`;
  }

  /**
   * Export test data as JSON
   */
  public exportJSON(): string {
    return JSON.stringify(this.testSessions, null, 2);
  }

  /**
   * Clear all test sessions
   */
  public clearSessions(): void {
    this.testSessions = [];
    this.currentSession = null;
    errorLogger.clear();
  }
}

// Export the singleton instance
export const testHelper = TestHelper.getInstance();