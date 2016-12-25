export interface RepoWatchConfig {
  /**
   * The file system path where the repository is.
   */
  path: string;

  /**
   * The time in seconds between each check
   * Optional, Default: 1 hour
   */
  poll?: number;

  /**
   * The remote name
   * Optional, Default: origin
   */
  remote?: string;
  /**
   * The branch.
   * Optional, Default: master
   */
  branch?: string;

  /**
   * Run only if the current branch matches the branch defined
   */
  strict?: boolean;

  /**
   * Sync a remote branch into the origin branch.
   * i.e: Pulling an "upstream" remote "master" into the "origin" master.
   * Optional, Default: undefined
   */
  sync?: {
    /**
     * The remote name
     * e.g: upstream
     */
    remote: string;
    /**
     * The branch.
     * e.g: master
     */
    branch: string;

    /**
     * If true rebase is used (rebasing from upstream), otherwise a merge
     * Optional, Default: false
     */
    rebase?: boolean;

    /**
     * If true, push the changes to the forked remote (origin)
     * Optional, Default: false
     */
    push?: boolean;
  }
}

const DEFAULT_REPO_INFO: RepoWatchConfig = {
  path: undefined,
  poll: 60 * 60,
  remote: 'origin',
  branch: 'master',
  strict: true
};

export function normalize(config: RepoWatchConfig): RepoWatchConfig {
  return Object.assign({}, DEFAULT_REPO_INFO, config) as any;
}