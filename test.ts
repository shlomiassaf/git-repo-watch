import * as Path from 'path';
import { GitWatcher, RepoResult } from './src';

const gw = new GitWatcher();


gw.check$.subscribe( info => {
  debugger;
});

gw.result$.subscribe( (result: RepoResult) => {
  debugger;
});

gw.watch({
  path: Path.join(__dirname, '..', '..', 'forks', 'material2'),
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


// import simpleGit = require('simple-git');
// const git = simpleGit(Path.join(__dirname, '..', '..', '..', 'forks', 'material2'));


