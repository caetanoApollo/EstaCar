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
    const query = 'SELECT id FROM usuarios WHERE email = ? AND senha = ?';

    db.execute(query, [email, senha], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao autenticar usuário' });
        }
        if (results.length === 0) {
            return res.status(401).json({ error: 'E-mail ou senha incorretos' });
        }

        res.json({ usuario_id: results[0].id });
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
    const { placa, marca, bloco, vaga, usuario_id, tipo_vaga } = req.body;

    console.log('Dados recebidos:', { placa, marca, bloco, vaga, usuario_id, tipo_vaga }); // Log dos dados recebidos

    // Verifica se a vaga já está ocupada
    const queryVagaOcupada = 'SELECT * FROM carros WHERE bloco = ? AND vaga = ?';
    db.execute(queryVagaOcupada, [bloco, vaga], (err, results) => {
        if (err) {
            console.error('Erro ao verificar vaga:', err); // Log de erro
            return res.status(500).json({ error: 'Erro ao verificar vaga' });
        }

        if (results.length > 0) {
            return res.status(400).json({ error: 'Vaga já ocupada' });
        }

        // Se a vaga estiver disponível, cadastra o carro
        const query = 'INSERT INTO carros (placa, marca, bloco, vaga, usuario_id, tipo_vaga) VALUES (?, ?, ?, ?, ?, ?)';
        db.execute(query, [placa, marca, bloco, vaga, usuario_id, tipo_vaga], (err, results) => {
            if (err) {
                console.error('Erro ao cadastrar veículo:', err); // Log de erro
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ error: 'Placa já cadastrada' });
                }
                return res.status(500).json({ error: 'Erro ao cadastrar veículo' });
            }
            res.status(201).json({ id: results.insertId });
        });
    });
});

app.get('/vagas', (req, res) => {
    const { bloco } = req.query;

    if (!bloco) {
        return res.status(400).json({ error: "Bloco não informado" });
    }

    const query = 'SELECT vaga, tipo_vaga FROM carros WHERE bloco = ?';
    db.execute(query, [bloco], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao buscar vagas' });
        }
        res.json(results);
    });
});

app.get('/vagas-especiais', (req, res) => {
    const query = 'SELECT * FROM carros WHERE tipo_vaga = "especial"';
    db.execute(query, [], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao buscar vagas especiais' });
        }
        res.json(results);
    });
});

app.get('/veiculos', (req, res) => {
    const { placa } = req.query;
    let query = 'SELECT placa, marca, bloco, vaga, tipo_vaga FROM carros'; // Inclua tipo_vaga na consulta
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

app.post('/logout', (req, res) => {
    // Como não estamos usando sessões, o logout é apenas uma confirmação no frontend
    res.status(200).json({ message: 'Logout realizado com sucesso' });
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});