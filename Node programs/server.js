var http = require('http')
var mysql = require('mysql')
var url = require('url')
var fs = require('fs');

http.createServer(function (req, res) {
    var q = url.parse(req.url, true);
    var filename = ".." + q.pathname;
    console.log(filename);
    if (req.method == 'POST' && req.url == '/user/create') {
        req.on('data', (data) => {
            data = JSON.parse(data);
            console.log(data);
            var con = mysql.createConnection({
                host: "localhost",
                user: "root",
                password: "root"
            });

            con.connect(function (err) {
                if (err) {
                    res.writeHead(404, { 'Content-Type': 'text/html' });
                    return res.end("404 Not Found");
                }
                var sql = `INSERT INTO customers (name, address,city,state,phone,fname,lname,email,zip,password) VALUES 
                ('${data.name}', '${data.address}','${data.city}','${data.state}','${data.phone}','${data.fname}','${data.lname}','${data.email}','${data.zip}','${data.password}')`
                con.query('use mydb', function (err, result) {
                    if (err) throw err;
                    con.query(sql, function (err, result) {
                        if (err) throw err;
                        console.log("data inserted");
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.write(JSON.stringify(result))
                        return res.end();
                    });
                });
                console.log(sql);
            });
        });
    } else if (req.url == '/list/pipe') {
        const rstream = fs.createReadStream('data.json');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        rstream.pipe(res)
    } else if (req.url == '/list/stream') {
        const rstream = fs.createReadStream('data.json');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        var a = 1;
        rstream.on('data', (data) => {
            res.write(data)
            console.log(a);
            a += 1;
        });
        rstream.on('end', () => {
            res.end()
            console.log(a);
        });
        rstream.on('error', (err) => {
            console.log(err)
            res.end('404 file not found')
        })
    } else if (req.url == '/list/sync') {
        const data = fs.readFileSync('data.json');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.write(data)
        return res.end()
    } else if (req.url == '/list/promises') {
        const p1 = new Promise((resolve, reject) => {
            if (resolve) {
                const data = fs.readFileSync('../data.json');
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.write(data)
                console.log('writing...');
                resolve({ msg: 'It works', data: 'some data' });
            } else {
                reject(new Error({ msg: 'It does not work' }));
            }
        });
        p1.then((value) => {
            console.log('then', value);
            console.log('success');
            res.end();
        }, (err) => {
            console.log(err);
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.write('file not found')
            res.end()
        });
    } else if (req.url == '/list/async') {
        fs.readFile('data.json', (err, data) => {
            if (err) {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.write('404 list not found.');
            } else {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.write(data)
            }
            return res.end()
        })

    } else if (filename == '../users/create.js') {
        var con = mysql.createConnection({
            host: "localhost",
            user: "root",
            password: "root"
        });

        con.connect(function (err) {
            if (err) {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                return res.end("404 Not Found");
            }
            var sql = `INSERT INTO customers (name, address,city,state,phone,fname,lname,email,zip,password) VALUES 
            ('${q.query.name}', '${q.query.address}','${q.query.city}','${q.query.state}','${q.query.phone}','${q.query.fname}','${q.query.lname}','${q.query.email}','${q.query.zip}','${q.query.pass}')`
            con.query('use mydb', function (err, result) {
                if (err) throw err;
                con.query(sql, function (err, result) {
                    if (err) throw err;
                    console.log("data inserted");
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.write(JSON.stringify(result))
                    return res.end();
                });
            });

        });
    } else if (req.url == '/users' && req.method == 'GET') {
        var con = mysql.createConnection({
            host: "localhost",
            user: "root",
            password: "root"
        });
        con.connect(function (err) {
            if (err) {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                return res.end("404 Not Found");
            }
            console.log('connected');
            con.query('use mydb', function (err, result) {
                var sql = 'select * from customers'
                con.query(sql, function (err, result) {
                    if (err) throw err;
                    console.log('query success');
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.write(JSON.stringify(result))
                    return res.end();
                })
            })
        })
    } else {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write('hello world!')
        res.end()
    }
}).listen(8081, '127.5.5.5');
