const { series } = require('gulp');
const { exec } = require('child_process');
const fs = require('fs');
const yaml = require('js-yaml');

function runCommand(command) {
  return function (cb) {
    exec(command, (err, stdout, stderr) => {
      console.log(stdout);
      console.error(stderr);
      cb(err);
    });
  };
}

function loadTasks(taskName) {
  const fileContents = fs.readFileSync('./gulp-tasks.yaml', 'utf8');
  const data = yaml.load(fileContents);
  const tasks = data.tasks[taskName];
  return tasks.map(runCommand);
}

exports.dev = series(...loadTasks('dev'));
exports.start = series(...loadTasks('start'));
exports.deploy = series(...loadTasks('deploy'));
