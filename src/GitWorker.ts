import PullSummary = simpleGit.PullSummary;

import { RepoWatchConfig } from './RepoWatchConfig';
import { GitWrapper } from './GitWrapper';


export class GitWorker {

  constructor(public git: GitWrapper, public config: RepoWatchConfig) {

  }

  /**
   * Sync the local branch using config instructions.
   * Based on the config it might do pull or pull/rebase/push (sync upstream)
   *
   * Return true if a change occurred.
   *
   * @returns {Promise<boolean>}
   */
  syncBranch(): Promise<boolean> {
    let branchCommit: string;

    return this.git.getCurrentBranch()
      .then(branch => branchCommit = branch.commit)
      .then( () => this.doPull() )
      .then( () => this.git.getCurrentBranch() )
      .then( branch => {
        const changed: boolean = branch.commit !== branchCommit;

        if (changed && this.config.sync && this.config.sync.push === true) {
          return this.doPush().then(() => changed as boolean);
        } else {
          return changed;
        }
      });
  }

  private doPull(): Promise<PullSummary> {
    const pullParams = {
      remote: this.config.sync ? this.config.sync.remote : this.config.remote,
      branch: this.config.sync ? this.config.sync.branch : this.config.branch,
      options: {}
    };

    if (this.config.sync && this.config.sync.rebase === true) {
      pullParams.options['--rebase'] = null;
    }

    return this.git.pull(pullParams.remote, pullParams.branch, pullParams.options);
  }

  private doPush() {
    return this.git.push(this.config.remote, this.config.branch);
  }
}