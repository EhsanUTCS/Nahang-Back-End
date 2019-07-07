const fs = require('fs')
const path = require('path');

function walk(dir, done){
    let results = [];
    fs.readdir(dir, (err, list) => {
        if (err) return done(err);
        let pending = list.length;
        if (!pending) return done(null, results);
        list.forEach((file) => {
            file = path.resolve(dir, file);
            fs.stat(file, (err, stat) => {
                if (stat && stat.isDirectory()) {
                    walk(file, (err, res) => {
                        results = results.concat(res);
                        if (!--pending) done(null, results);
                    });
                } else {
                    if (/.migrate.js$/.test(file)) {
                        results.push(require(file));
                    }
                    if (!--pending) done(null, results);
                }
            });
        });
    });
};

function run(err, migrates) {
  if (err) {
    return console.error("API Service init routes error!", err);
  }

  migrates.forEach(migrate => {
    migrate()
  });
}

utils.walk('./services', run)