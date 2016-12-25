import SimpleGit = simpleGit.SimpleGit;
import PullSummary = simpleGit.PullSummary;
import Branch = simpleGit.Branch;

import { PromiseCompleter } from './utils';


export class GitWrapper {

  constructor(public git: SimpleGit) {

  }

  /**
   * Returns the current branch
   * @returns {Promise<Branch>}
   */
  getCurrentBranch(): Promise<Branch> {
    const completer = new PromiseCompleter<Branch>();

    this.git.branch((err, result) => {
        if (err) {
          completer.reject(err);
        } else {
          completer.resolve(result.branches[result.current]);
        }
      });

    return completer.promise;
  }

  getBranch(name: string): Promise<Branch | undefined> {
    const completer = new PromiseCompleter<Branch | undefined>();

    this.git.branch((err, result) => {
      if (err) {
        completer.reject(err);
      } else {
        completer.resolve(result.branches[name]);
      }
    });

    return completer.promise;
  }

  getHead(): Promise<string> {
    const completer = new PromiseCompleter<string>();

    this.git.raw(
      [ 'rev-list', 'HEAD', '-n', '1' ],
      (err, result) => {
        if (err) {
          completer.reject(err);
        } else {
          completer.resolve(result);
        }
      });

    return completer.promise;
  }

  pull(remote: string, branch: string, options: any): Promise<PullSummary> {
    const completer = new PromiseCompleter<PullSummary>();

    this.git.pull(remote, branch, options, (err, summary: PullSummary) => {
      if (err) {
        completer.reject(err);
      } else {
        completer.resolve(summary);
      }
    });

    return completer.promise;
  }

  push(remote: string, branch: string, options?: any): Promise<void> {
    const completer = new PromiseCompleter<void>();

    this.git.push(remote, branch, options, (err) => {
      if (err) {
        completer.reject(err);
      } else {
        completer.resolve();
      }
    });

    return completer.promise;
  }

  hasChanges(): Promise<boolean> {
    return new Promise<boolean>( (resolve, reject) => {
      this.git.pull((err, update: PullSummary) => {
        if (err) {
          reject(err);
        } else {
          resolve(update && update.summary.changes > 0);
        }
      });
    });
  }
}