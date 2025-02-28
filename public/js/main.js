document.addEventListener('DOMContentLoaded', () => {
    const cadastroButton = document.querySelector('#cadastro button');
    const loginButton = document.querySelector('#loginButton');
    const blocoSelect = document.getElementById('bloco');
    const cadastrarVeiculoButton = document.getElementById('cadastrarVeiculo');
    const buscaInput = document.getElementById('busca');
    const tbody = document.querySelector('tbody');
    const logoutButton = document.getElementById('logoutButton');

    // Função para fazer logout
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            fetch('/logout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            })
            .then(response => response.json())
            .then(data => {
                if (data.message) {
                    alert(data.message);
                    localStorage.removeItem('usuario_id'); // Remove o ID do usuário do localStorage
                    window.location.href = '/login.html'; // Redireciona para a página de login
                } else {
                    alert('Erro ao fazer logout.');
                }
            })
            .catch(error => console.error('Erro:', error));
        });
    }

    // Função para preencher o dropdown de vagas
    function preencherVagas(bloco) {
        const vagaSelect = document.getElementById('num');
        vagaSelect.innerHTML = ''; // Limpa o dropdown

        // Vagas normais (1 a 15)
        for (let i = 1; i <= 15; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `Vaga ${i} - Normal`;
            vagaSelect.appendChild(option);
        }

        // Vagas especiais (16, 17, 18)
        for (let i = 16; i <= 18; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `Vaga ${i} - Especial`;
            vagaSelect.appendChild(option);
        }
    }

    // Preenche as vagas quando o bloco é selecionado
    if (blocoSelect) {
        blocoSelect.addEventListener('change', () => {
            const bloco = blocoSelect.value;
            preencherVagas(bloco);
        });

        // Preenche as vagas ao carregar a página
        preencherVagas(blocoSelect.value);
    }

    // Cadastra o veículo
    if (cadastrarVeiculoButton) {
        cadastrarVeiculoButton.addEventListener('click', () => {
            const placa = document.getElementById('Placa').value.trim();
            const marca = document.getElementById('marca').value.trim();
            const bloco = document.getElementById('bloco').value.trim();
            const vaga = document.getElementById('num').value.trim();
            const usuario_id = localStorage.getItem('usuario_id');

            if (!placa || !marca || !bloco || !vaga) {
                alert('Todos os campos são obrigatórios.');
                return;
            }

            if (!usuario_id) {
                alert('Usuário não autenticado. Faça login ou cadastre-se.');
                return;
            }

            // Dados para enviar ao servidor
            const dados = {
                placa,
                marca,
                bloco,
                vaga: parseInt(vaga), // Converte para número
                usuario_id: parseInt(usuario_id), // Converte para número
                tipo_vaga: vaga > 15 ? 'especial' : 'normal' // Define o tipo de vaga
            };

            // Envia os dados para o servidor
            fetch('/cadastro-veiculo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados)
            })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    alert(data.error);
                } else {
                    alert('Veículo cadastrado com sucesso!');
                    window.location.href = '/vizu.html'; // Redireciona para a página de vizualização
                }
            })
            .catch(error => {
                console.error('Erro:', error);
                alert('Erro ao cadastrar veículo.');
            });
        });
    }

    // Login
    if (loginButton) {
        loginButton.addEventListener('click', () => {
            const emailInput = document.getElementById('email');
            const senhaInput = document.getElementById('pass');
    
            if (!emailInput || !senhaInput) {
                alert('Elementos do formulário não encontrados.');
                return;
            }
    
            const email = emailInput.value.trim();
            const senha = senhaInput.value.trim();
    
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
                    localStorage.setItem('usuario_id', data.usuario_id); // Armazena o ID no localStorage
                    window.location.href = '/carro.html';
                }
            })
            .catch(error => console.error('Erro:', error));
        });
    }

    // Cadastro de usuário
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

    // Busca de veículos
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

    function buscarVeiculos(placa = '') {
        fetch(`/veiculos?placa=${placa}`)
            .then(response => response.json())
            .then(data => {
                tbody.innerHTML = ''; // Limpa a tabela
                if (data.length === 0) {
                    // Exibe uma mensagem se nenhum veículo for encontrado
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td colspan="5" style="text-align: center;">Nenhum veículo encontrado</td>
                    `;
                    tbody.appendChild(tr);
                } else {
                    // Preenche a tabela com os veículos encontrados
                    data.forEach(veiculo => {
                        const tr = document.createElement('tr');
                        tr.innerHTML = `
                            <td>${veiculo.placa}</td>
                            <td>${veiculo.marca}</td>
                            <td>${veiculo.bloco}</td>
                            <td>${veiculo.vaga}</td>
                            <td>${veiculo.tipo_vaga}</td>
                        `;
                        tbody.appendChild(tr);
                    });
                }
            })
            .catch(error => console.error('Erro:', error));
    }

    // Busca veículos ao carregar a página
    buscarVeiculos();

    // Busca veículos ao digitar no campo de busca
    if (buscaInput) {
        buscaInput.addEventListener('input', (e) => {
            const placa = e.target.value.trim();
            buscarVeiculos(placa);
        });
    }

    // Função para buscar todos os veículos
    function buscarTodosVeiculos() {
        fetch('/veiculos')
            .then(response => response.json())
            .then(data => {
                const tbody = document.querySelector('tbody');
                tbody.innerHTML = ''; // Limpa a tabela
                if (data.length === 0) {
                    // Exibe uma mensagem se nenhum veículo for encontrado
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td colspan="5" style="text-align: center;">Nenhum veículo encontrado</td>
                    `;
                    tbody.appendChild(tr);
                } else {
                    // Preenche a tabela com todos os veículos
                    data.forEach(veiculo => {
                        const tr = document.createElement('tr');
                        tr.innerHTML = `
                            <td>${veiculo.placa}</td>
                            <td>${veiculo.marca}</td>
                            <td>${veiculo.bloco}</td>
                            <td>${veiculo.vaga}</td>
                            <td>${veiculo.tipo_vaga}</td>
                        `;
                        tbody.appendChild(tr);
                    });
                }
            })
            .catch(error => console.error('Erro:', error));
    }

    // Busca todos os veículos ao carregar a página
    buscarTodosVeiculos();

    // Busca todos os veículos ao clicar no botão (se necessário)
    if (buscarTodosButton) {
        buscarTodosButton.addEventListener('click', buscarTodosVeiculos);
    }
});