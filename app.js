const dir_nms = 'C:\\Users\\khudo\\node_modules\\sync-mysql';

const Mysql = require(dir_nms);
const connection = new Mysql({
    host: 'localhost',
    user: 'root',
    password: '1111',
    database: 'test2',
    charset: 'utf8mb4'
});

const qs = require('querystring');

function reqPost(request, response) {
    if (request.method == 'POST') {
        let body = '';

        request.on('data', function (data) {
            body += data;
        });

        request.on('end', function () {
            const post = qs.parse(body);
            console.log('Received POST data: ', post);

            if (post['action'] === 'delete') {
                const sDelete = `DELETE FROM individuals WHERE id=${post['id']}`;
                connection.query(sDelete);
                console.log('Deleted. Hint: ' + sDelete);
            } else if (post['action'] === 'update') {
                const sUpdate = `UPDATE individuals SET first_name="${post['first_name']}", last_name="${post['last_name']}", patronymic="${post['patronymic']}", passport="${post['passport']}", inn="${post['inn']}", snils="${post['snils']}", driver_license="${post['driver_license']}", additional_docs="${post['additional_docs']}", note="${post['note']}" WHERE id=${post['id']}`;
                connection.query(sUpdate);
                console.log('Updated. Hint: ' + sUpdate);
            } else if (post['action'] === 'insert') {
                const sInsert = `INSERT INTO individuals (first_name, last_name, patronymic, passport, inn, snils, driver_license, additional_docs, note) VALUES ("${post['first_name']}", "${post['last_name']}", "${post['patronymic']}", "${post['passport']}", "${post['inn']}", "${post['snils']}", "${post['driver_license']}", "${post['additional_docs']}", "${post['note']}")`;
                connection.query(sInsert);
                console.log('Inserted. Hint: ' + sInsert);
            } else if (post['action'] === 'edit') {
                response.writeHead(200, {'Content-Type': 'text/html'});
                const record = connection.query(`SELECT * FROM individuals WHERE id=${post['id']}`)[0];
                response.write(`
                    <form action="." method="post">
                        <label>Имя</label><div>:</div><input type="text" name="first_name" value="${record.first_name}" />
                        <label>Фамилия</label><div>:</div><input type="text" name="last_name" value="${record.last_name}" />
                        <label>Отчество</label><div>:</div><input type="text" name="patronymic" value="${record.patronymic}" />
                        <label>Паспорт</label><div>:</div><input type="text" name="passport" value="${record.passport}" />
                        <label>ИНН</label><div>:</div><input type="text" name="inn" value="${record.inn}" />
                        <label>СНИЛС</label><div>:</div><input type="text" name="snils" value="${record.snils}" />
                        <label>Водительское удостоверение</label><div>:</div><input type="text" name="driver_license" value="${record.driver_license}" />
                        <label>Дополнительные документы</label><div>:</div><input type="text" name="additional_docs" value="${record.additional_docs}" />
                        <label>Примечания</label><div>:</div><input type="text" name="note" value="${record.note}" />
                        <input type="hidden" name="id" value="${record.id}" />
                        <input type="hidden" name="action" value="update" />
                        <input type="submit" value="Обновить" />
                    </form>
                `);
                response.end();
            }
        });
    }
}

function viewSelect(res) {
    let results = connection.query('SHOW COLUMNS FROM individuals');
    res.write('<tr>');
    for (let i = 0; i < results.length; i++)
        res.write('<td>' + results[i].Field + '</td>');
    res.write('<td>Actions</td>');
    res.write('</tr>');

    results = connection.query('SELECT * FROM individuals');
    for (let i = 0; i < results.length; i++) {
        res.write('<tr>');
        res.write('<td>' + results[i].id + '</td>');
        res.write('<td>' + results[i].first_name + '</td>');
        res.write('<td>' + results[i].last_name + '</td>');
        res.write('<td>' + results[i].patronymic + '</td>');
        res.write('<td>' + results[i].passport + '</td>');
        res.write('<td>' + results[i].inn + '</td>');
        res.write('<td>' + results[i].snils + '</td>');
        res.write('<td>' + results[i].driver_license + '</td>');
        res.write('<td>' + results[i].additional_docs + '</td>');
        res.write('<td>' + results[i].note + '</td>');
        res.write('<td><form method="post"><input type="hidden" name="id" value="' + results[i].id + '"/><input type="hidden" name="action" value="delete"/><input type="submit" value="Удалить"/></form></td>');
        res.write('<td><form method="post"><input type="hidden" name="id" value="' + results[i].id + '"/><input type="hidden" name="action" value="edit"/><input type="submit" value="Редактировать"/></form></td>');
        res.write('</tr>');
    }
}

function viewVer(res) {
    const results = connection.query('SELECT VERSION() AS ver');
    res.write(results[0].ver);
}

const http = require('http');
const server = http.createServer((req, res) => {
    reqPost(req, res);
    console.log('Loading...');

    res.statusCode = 200;

    const fs = require('fs');
    const array = fs.readFileSync(__dirname + '\\select.html').toString().split("\n");
    console.log(__dirname + '\\select.html');
    for (let i in array) {
        if ((array[i].trim() != '@tr') && (array[i].trim() != '@ver')) res.write(array[i]);
        if (array[i].trim() == '@tr') viewSelect(res);
        if (array[i].trim() == '@ver') viewVer(res);
    }
    res.end();
    console.log('User Done.');
});

const hostname = '127.0.0.1';
const port = 3000;
server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
