import { LinearClient } from '@linear/sdk';

interface CreateIssueParams {
  title: string;
  description: string;
  teamId: string;
}

interface IssueResponse {
  success: boolean;
  issue?: {
    id: string;
    title: string;
    description?: string;
    state?: { name: string };
  };
}

export class LinearService {
  private client: LinearClient;

  constructor(apiKey: string) {
    this.client = new LinearClient({ apiKey });
  }

  async createIssue(params: CreateIssueParams): Promise<IssueResponse> {
    if (!params.title) {
      throw new Error('Title is required');
    }

    try {
      return await this.client.createIssue(params) as IssueResponse;
    } catch (error) {
      throw new Error(`Failed to create Linear issue: ${(error as Error).message}`);
    }
  }

  async updateIssue(issueId: string, updates: Partial<CreateIssueParams>): Promise<{ success: boolean }> {
    return await this.client.updateIssue(issueId, updates) as { success: boolean };
  }

  async getIssue(issueId: string): Promise<IssueResponse['issue']> {
    const issue = await this.client.issue(issueId) as IssueResponse['issue'];
    if (!issue) {
      throw new Error(`Issue not found: ${issueId}`);
    }
    return issue;
  }
}