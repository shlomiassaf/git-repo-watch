import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import simpleGit = require('simple-git');
import PullSummary = simpleGit.PullSummary;
import SimpleGit = simpleGit.SimpleGit;

import * as errorFactory from './Errors';
import { RepoWatchConfig, normalize } from './RepoWatchConfig';
import { GitWrapper } from './GitWrapper';
import { GitWorker } from "./GitWorker";

interface WatcherRef {
  config: RepoWatchConfig;
  timeoutRef: any;
}

export class RepoResult {
  error?: Error;
  changed?: boolean;

  constructor(public config: RepoWatchConfig, errorOrChanged: boolean | Error) {
    if (typeof errorOrChanged === 'boolean') {
      this.changed = errorOrChanged;
    } else {
      this.error = errorOrChanged;
    }
  }
}



export class GitWatcher {
  private checkSubject = new Subject<RepoWatchConfig>();
  private resultSubject = new Subject<RepoResult>();

  public check$ = this.checkSubject.asObservable();
  public result$ = this.resultSubject.asObservable();

  private watchers = new Map<string, WatcherRef>();

  watch(info: RepoWatchConfig): void {
     if (this.watchers.has(info.path)) {
      throw errorFactory.repoAlreadyWatched(info);
    }

    const watchRef: WatcherRef = {
      config: normalize(info),
      timeoutRef: undefined
    };

     // sync check for git existence (will throw if not there)
    const git = this.createGitWrapper(watchRef.config);

    this.validate(watchRef.config)
      .then( () => {
        this.watchers.set(info.path,  watchRef);

        this.watchInternal(watchRef);
      })
      .catch( error => this.emit(watchRef.config, error) );
  }

  private watchInternal(watchRef: WatcherRef): void {
    const config = watchRef.config;
    this.checkSubject.next(config);

    try {
      const git = this.createGitWrapper(config);
      const worker = new GitWorker(git, config);
      worker.syncBranch()
        .then( result => this.emit(config, result) )
        .catch( error => this.emit(config, error) )
        .then( () => {
          if (this.watchers.has(config.path)) {
            const currWatchRef = this.watchers.get(config.path);
            currWatchRef.timeoutRef = setTimeout(() => this.watchInternal(currWatchRef), config.poll * 1000);
          }
        });

    } catch (error) {
      this.emit(config, error);
    }
  }

  unwatch(info: RepoWatchConfig): void {
    const repoInfo = this.watchers.get(info.path);
    if (repoInfo) {
      this.watchers.delete(info.path);
      if (repoInfo.timeoutRef) {
        clearTimeout(repoInfo.timeoutRef);
      }
    }
  }


  private validate(config: RepoWatchConfig): Promise<void> {
    try {
      const git = this.createGitWrapper(config);

      if (config.strict === true) {
        return git.getCurrentBranch()
          .then(branch => {
            if (branch.name !== config.branch) {
              throw errorFactory.branchMismatch(config);
            }
          });
      } else {
        return Promise.resolve();
      }

    } catch (error) {
      return Promise.reject(error);
    }
  }


  private emit(config: RepoWatchConfig, errorOrChanged: boolean | Error) {
    this.resultSubject.next(new RepoResult(config, errorOrChanged));
  }

  private createGitWrapper(config: RepoWatchConfig): GitWrapper {
    try {
      return new GitWrapper(simpleGit(config.path));
    } catch (err) {
      throw errorFactory.invalidLocalGit(config, err);
    }
  }
}

