declare var simpleGit: simpleGit.SimpleGitStatic;

declare module 'simple-git' {
  export = simpleGit;
}

declare namespace simpleGit {

  export interface HandlerFn<T> {
    (err: Error, result: T): void;
  }

  export interface PullSummary {
    deletions: any;
    insertions: any;
    summary: {
      changes: number;
      deletions: number;
      insertions: number;
    }
  }

  export interface Branch {
    commit: string;
    current: boolean;
    label: string;
    name: string;
  }

  export interface BranchSummary {
    branches: { [key: string]: Branch};
    current: string;
    detached: boolean;

    // push(current: boolean, detached: boolean, name: string, commit: string, label: string): void;
  }

  export interface SimpleGit {
    pull(handlerFn: HandlerFn<PullSummary>): SimpleGit;
    pull(remote: string, branch: string, handlerFn: HandlerFn<PullSummary>): SimpleGit;
    pull(remote: string, branch: string, options: any, handlerFn: HandlerFn<PullSummary>): SimpleGit;

    push(remote: string, branch: string, handlerFn: HandlerFn<void>): SimpleGit;
    push(remote: string, branch: string, options: any, handlerFn: HandlerFn<void>): SimpleGit;

    branch(handlerFn: HandlerFn<BranchSummary>): SimpleGit;
    branch(options: any, handlerFn: HandlerFn<BranchSummary>): SimpleGit;

    raw(commands: string[], handlerFn: HandlerFn<any>): SimpleGit;
  }

  interface SimpleGitStatic {
    (repoPath: string): SimpleGit;
  }
}

