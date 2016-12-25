import { RepoWatchConfig } from "./RepoWatchConfig";

export class InvalidLocalGitError extends Error {
  constructor(public config: RepoWatchConfig, public sourceError: Error) {
    super('Invalid local git supplied: ' + config.path);
    this.stack = sourceError.stack;
  }
}
export function invalidLocalGit(config: RepoWatchConfig, sourceError: Error): InvalidLocalGitError {
  return new InvalidLocalGitError(config, sourceError);
}


export class RepoAlreadyWatchedError extends Error {
  constructor(public config: RepoWatchConfig) {
    super('Repo already watched: ' + config.path);
  }
}
export function repoAlreadyWatched(config: RepoWatchConfig): RepoAlreadyWatchedError {
  return new RepoAlreadyWatchedError(config);
}


export class BranchMismatchError extends Error {
  constructor(public config: RepoWatchConfig) {
    super('Current branch is not the target branch. (strict mode)');
  }
}
export function branchMismatch(config: RepoWatchConfig): BranchMismatchError {
  return new BranchMismatchError(config);
}


