const http = require('http');
const fs = require('fs');
const exec = require('child_process').exec;

exec('java -version', (err, stdout, stderr) => {
  if(err) {
    console.error('Java Runtime Required');
    process.exit(1);
  }
});

const port = process.env.PORT || 9300;

const server = http.createServer((req, res) => {
  if(req.method == 'PUT') {
    let ts = Date.now();
    let file = `${__dirname}/${ts}`;
    let stream = fs.createWriteStream(file);
    req.on('data', data => {
       stream.write(data);
    });
    req.on('end', () => {
      if(stream.length == 0) {
        res.statusCode = 400;
        res.write('Node Tika Server (Apache Tika 1.16). Zero byte error');
        res.end();
      }
      stream.end();
      let action = req.url.replace('/','');
      exec(`java -jar ${__dirname}/bin/tika-app-1.16.jar -${action} ${file}`, (err, stdout, stderr) => {
        if(err) {
          res.statusCode = 500;
          res.write('Internal Server Error');
          res.end();
        } else {
          res.end(stdout);
        }
        fs.unlinkSync(file);
      });
    });
  } else {
    res.statusCode = 400;
    res.write('Node Tika Server (Apache Tika 1.16). Please PUT');
    res.end();
  }
});

server.listen(port, err => {
  console.log(`node-tika-server listening on port ${port}`)
})
