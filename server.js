const express = require('express');
const body_parser = require('body-parser');
const cors = require('cors');
const db = require('./db_connection');

const app = express();
const port = 3000;

app.use(cors());
app.use(body_parser.json());
app.use(express.static('public'));

app.post('/cadastro', (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    const query = 'INSERT INTO usuarios (email, senha) VALUES (?, ?)';
    db.execute(query, [email, senha], (err, results) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ error: 'Email já cadastrado' });
            }
            return res.status(500).json({ error: 'Erro ao cadastrar usuário' });
        }
        res.status(201).json({ id: results.insertId });
    });
});

app.post('/login', (req, res) => {
    const { email, senha } = req.body;
    const query = 'SELECT * FROM usuarios WHERE email = ? AND senha = ?';
    db.execute(query, [email, senha], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao autenticar usuário' });
        }
        if (results.length === 0) {
            return res.status(401).json({ error: 'E-mail ou senha incorretos' });
        }

        db.query('SELECT id FROM usuarios WHERE email = ? AND senha = ?', [email, senha], (err, results) => {
            if (err) {
                res.status(500).json({ error: 'Erro interno no servidor' });
                return;
            }
        
            if (results.length === 0) {
                res.status(401).json({ error: 'Usuário ou senha inválidos' });
                return;
            }
        
            req.session.usuario_id = results[0].id;
            res.json({ usuario_id: results[0].id });
        });
        
    });
});

app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao fazer logout' });
        }
        res.status(200).json({ message: 'Logout realizado com sucesso' });
    });
});

function verificarAutenticacao(req, res, next) {
    if (!req.session.usuario_id) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
    }
    next();
}

app.get('/protegida', verificarAutenticacao, (req, res) => {
    res.json({ message: 'Rota protegida', usuario_id: req.session.usuario_id });
});


app.post('/cadastro-veiculo', (req, res) => {
    const { placa, marca, bloco, vaga, usuario_id } = req.body;
    const query = 'INSERT INTO carros (placa, marca, bloco, vaga, usuario_id) VALUES (?, ?, ?, ?, ?)';
    db.execute(query, [placa, marca, bloco, vaga, usuario_id], (err, results) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ error: 'Placa já cadastrada' });
            }
            return res.status(500).json({ error: 'Erro ao cadastrar veículo' });
        }
        res.status(201).json({ id: results.insertId });
    });
});

app.get('/veiculos', (req, res) => {
    const { placa } = req.query;
    let query = 'SELECT * FROM carros';
    if (placa) {
        query += ' WHERE placa LIKE ?';
        db.execute(query, [`%${placa}%`], (err, results) => {
            if (err) {
                return res.status(500).json({ error: 'Erro ao buscar veículos' });
            }
            res.json(results);
        });
    } else {
        db.execute(query, [], (err, results) => {
            if (err) {
                return res.status(500).json({ error: 'Erro ao buscar veículos' });
            }
            res.json(results);
        });
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});