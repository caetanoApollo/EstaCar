document.addEventListener('DOMContentLoaded', () => {
    const cadastroButton = document.querySelector('#cadastro button');
    const loginButton = document.querySelector('#loginButton');
    const buscaInput = document.getElementById('busca');
    const cadastroVeiculoForm = document.getElementById('cadastro-veiculo');

    function getUserId(){
        return localStorage.getItem('usuario_id');
    }

    if (loginButton) {
        loginButton.addEventListener('click', () => {
            const email = document.getElementById('email').value.trim();
            const senha = document.getElementById('pass').value.trim();

            if (!email || !senha) {
                alert('Preencha todos os campos.');
                return;
            }

            fetch('/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, senha })
            })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    alert(data.error);
                } else {
                    alert('Login realizado com sucesso!');
                    localStorage.setItem('usuario_id', data.usuario_id);
                    window.location.href = '/carro.html';
                }
            })
            .catch(error => console.error('Erro:', error));
        });
    }

    if (cadastroButton) {
        cadastroButton.addEventListener('click', () => {
            const email = document.getElementById('email').value.trim();
            const senha = document.getElementById('pass').value.trim();
            const confirmPass = document.getElementById('confirmPass').value.trim();

            if (!email || !senha || !confirmPass) {
                alert('Todos os campos são obrigatórios');
                return;
            }
            if (senha !== confirmPass) {
                alert('As senhas não coincidem');
                return;
            }

            fetch('/cadastro', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, senha })
            })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    alert(data.error);
                } else {
                    alert('Cadastro realizado com sucesso!');
                    window.location.href = '/login.html';
                }
            })
            .catch(error => console.error('Erro:', error));
        });
    }

    if (cadastroVeiculoForm) {
        cadastroVeiculoForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const placa = document.getElementById('Placa').value.trim();
            const marca = document.getElementById('marca').value.trim();
            const bloco = document.getElementById('bloco').value.trim();
            const vaga = document.getElementById('num').value.trim();
            const usuario_id = getUserId();

            if (!usuario_id) {
                alert('Usuário não autenticado. Faça login ou cadastre-se.');
                return;
            }

            fetch('/cadastro-veiculo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ placa, marca, bloco, vaga, usuario_id })
            })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    alert(data.error);
                } else {
                    alert('Veículo cadastrado com sucesso!');
                    window.location.href = '/visu.html';
                }
            })
            .catch(error => console.error('Erro:', error));
        });
    }

    if (buscaInput) {
        buscaInput.addEventListener('input', (e) => {
            const placa = e.target.value.trim();
            fetch(`/veiculos?placa=${placa}`)
                .then(response => response.json())
                .then(data => {
                    const tbody = document.querySelector('tbody');
                    tbody.innerHTML = '';
                    data.forEach(veiculo => {
                        const tr = document.createElement('tr');
                        tr.innerHTML = `
                            <td>${veiculo.placa}</td>
                            <td>${veiculo.marca}</td>
                            <td>${veiculo.bloco}</td>
                            <td>${veiculo.vaga}</td>
                        `;
                        tbody.appendChild(tr);
                    });
                })
                .catch(error => console.error('Erro:', error));
        });
    }
});