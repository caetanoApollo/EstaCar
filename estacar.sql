-- Remove o banco de dados existente (se necessário)
DROP DATABASE IF EXISTS estacar;

-- Cria o banco de dados
CREATE DATABASE estacar;
USE estacar;

-- Tabela de usuários
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL
);

-- Tabela de carros
CREATE TABLE carros (
    id INT AUTO_INCREMENT PRIMARY KEY,
    placa VARCHAR(8) NOT NULL UNIQUE,
    marca VARCHAR(50) CHECK (marca IN ('Toyota', 'Honda', 'Volkswagen', 'Ford', 'Chevrolet', 'Nissan', 'BMW', 'Mercedes-Benz', 'Audi', 'Fiat', 'Kia', 'Outro')),
    bloco CHAR(1) CHECK (bloco IN ('A', 'B', 'C', 'D', 'E')),
    vaga INT, -- Sem restrição CHECK
    tipo_vaga ENUM('normal', 'especial') DEFAULT 'normal', -- Tipo de vaga
    usuario_id INT,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

INSERT INTO usuarios (email, senha) VALUES ('caetano@gmail.com', '123');