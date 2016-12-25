# git-repo-watch 
A node utility to sync git repositories and get notifications using RxJS.
 
There are 2 operations modes:
  - **Sync** (simple `git pull`)
  - **Sync Fork** (pull source remote -> rebase -> push fork remote)

###Sync
The **Sync** method is straight forward, you have a git repository with 1 remote.  

###Sync Fork
The **Sync Fork** method is used when you have a remote that was forked and you want to get notified when the fork changes and sync the 2.  

>It is usually referred to as **origin** and **upstream**.  

Example:
This is the material2 repository: `https://github.com/angular/material2`

Forking it to my own github account: `https://github.com/shlomiassaf/material2`

Running `git remote -v`:
```
origin	https://github.com/shlomiassaf/material2.git (fetch)
upstream	https://github.com/angular/material2.git (fetch)
```

The **origin** remote is my fork, the **upstream** remote is the source for updates.

### API
The `GitWatcher` class is used to watch repositories.

```
import { GitWatcher } from 'git-repo-watch'

// TypeScript:
// import { GitWatcher, RepoResult } from './src'; 

const watcher = new GitWatcher();
```

#### GitWatcher
  -  **watch(info: RepoWatchConfig): void**  
  Start watching a repository.
  
  -  unwatch(info: RepoWatchConfig): void  
  Stop watching a repository
  
  -  check$: Observable<RepoWatchConfig>  
  Notification stream triggered before a git repository starts a sync check.
  
  -  result$: Observable<RepoResult>  
  Notification stream triggered after a git repository sync check as ended.

#### RepoWatchConfig  
  - **path: string**  
  The file system path where the repository is.
    
  - **poll: number**  
  The time in seconds between each check  
  Optional, Default: 1 hour
   
  - **remote: string**  
  The remote name to sync in **sync** mode
  In **Sync Fork** mode this is the fork to update to.  
  Optional, Default: origin

   
  - **branch: string**  
  The branch name to sync in **sync** mode  
  In **Sync Fork** mode this is the fork to update to.  
  Optional, Default: master

   - **strict: boolean**  
   Run only if the current branch matches the branch defined.
   
  - **sync**
  Sync Fork mode definition, sync a remote branch into the origin branch.  
  i.e: Pulling an "upstream" remote "master" into the "origin" master.  
  Optional, Default: undefined (sync mode)     
    - **remote: string**  
    The remote name to pull from    
    e.g: upstream
        
    - **branch: string**  
      The branch name to pull from    
      e.g: master        

    - **rebase: boolean**  
     If true rebase is used (rebasing from upstream), otherwise a merge
     Optional, Default: false
     
    - **push?: boolean**  
    If true, push the changes to the forked remote (origin)
    Optional, Default: false
  }
  
  
####RepoResult
  - **config: RepoWatchConfig**
  The config object for this instance.
  
  - **error: Error**
  If an error occurred this will be the Error object.
  
  - **changed: boolean**
  True if the pull was different, i.e: the source repo was updated.
  Irrelevant when an error has occurred.



## Example (TypeScript)
```ts
import { GitWatcher, RepoResult } from './src';

const gw = new GitWatcher();

// Use Sync Fork to check for changes in the upstream an update.
gw.watch({
  path: '/repos/forks/material2',
  remote: 'origin',
  branch: 'master',
  strict: true,
  sync: {
    remote: 'upstream',
    branch: 'master',
    rebase: true,
    push: true
  }
});

gw.check$.subscribe( info => {
  // will fire every check.
});

gw.result$.subscribe( (result: RepoResult) => {
  // will fire once a check is finished.
  // When using Sync Fork the origin is now updated (and local ofcourse)
  
  if (result.error) {   
   gw.unwatch(result.config);
   // don't forget to unsubscrive...
  } else {
    if (result.checked === true) {
      // new version, we can build it, publish to a site... whatever.
    }
  }   
});
```

