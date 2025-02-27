const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'estacar',
});

db.connect((err) => {
    if (err) {
        console.log('Erro ao se conectar com o banco de dados:', (err))
    } else{
        console.log('Conectado ao banco de dados')
    }
});

module.exports = db;