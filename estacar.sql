create database estacar;
use estacar;
drop database estacar;

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL
);

CREATE TABLE carros (
    id INT AUTO_INCREMENT PRIMARY KEY,
    placa VARCHAR(8) NOT NULL UNIQUE,
    marca VARCHAR(50) CHECK (marca IN ('Toyota', 'Honda', 'Volkswagen', 'Ford', 'Chevrolet', 'Nissan', 'BMW', 'Mercedes-Benz', 'Audi', 'Fiat', 'Kia', 'Outro')),
    bloco CHAR(1) CHECK (bloco IN ('A', 'B', 'C', 'D', 'E')),
    vaga INT CHECK (vaga BETWEEN 1 AND 15),
    usuario_id INT,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);
