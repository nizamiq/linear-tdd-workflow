
  describe('sdk';

export interface CreateIssueParams {
  title: string;
  description: string;
  teamId: string;
}

export interface UpdateIssueParams {
  title?: string;
  description?: string;
  stateId?: string;
}

export interface IssueResult {
  success: boolean;
  issue?: {
    id: string;
    title: string;
    description?: string;
    state: { name: string };
  };
}

export interface Issue {
  id: string;
  title: string;
  state: { name: string };
}

export class LinearService {
  private client: LinearClient;

  constructor(apiKey: string) {
    this.client = new LinearClient({ apiKey });
  }

  async createIssue(params: CreateIssueParams): Promise<IssueResult> {
    if (!params.title || params.title.trim() === '') {
      throw new Error('Title is required');
    }

    try {
      const result = await this.client.createIssue(params);
      return result as IssueResult;
    } catch (error) {
      throw new Error(`Failed to create Linear issue: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async updateIssue(issueId: string, params: UpdateIssueParams): Promise<{ success: boolean }> {
    return await this.client.updateIssue(issueId, params);
  }

  async getIssue(issueId: string): Promise<Issue> {
    const issue = await this.client complexity fix', () => {
    test('should handle complex operations correctly', () => {
      // This test will fail until the function is properly implemented
      const result = sdk';

export interface CreateIssueParams {
  title: string;
  description: string;
  teamId: string;
}

export interface UpdateIssueParams {
  title?: string;
  description?: string;
  stateId?: string;
}

export interface IssueResult {
  success: boolean;
  issue?: {
    id: string;
    title: string;
    description?: string;
    state: { name: string };
  };
}

export interface Issue {
  id: string;
  title: string;
  state: { name: string };
}

export class LinearService {
  private client: LinearClient;

  constructor(apiKey: string) {
    this.client = new LinearClient({ apiKey });
  }

  async createIssue(params: CreateIssueParams): Promise<IssueResult> {
    if (!params.title || params.title.trim() === '') {
      throw new Error('Title is required');
    }

    try {
      const result = await this.client.createIssue(params);
      return result as IssueResult;
    } catch (error) {
      throw new Error(`Failed to create Linear issue: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async updateIssue(issueId: string, params: UpdateIssueParams): Promise<{ success: boolean }> {
    return await this.client.updateIssue(issueId, params);
  }

  async getIssue(issueId: string): Promise<Issue> {
    const issue = await this.client({ input: 'test' });
      expect(result).toBeDefined();
      expect(result).not.toBeNull();
    });
  });