# Contexto

Esta aplicação deverá ser a responsável por ajudar em uma tarefa de gestão.

PROBLEMA: Todas as semanas eu preciso elencar, notificar em canal do discord e atribuir o cargo de "bombeiro" à algumas pessoas do meu time.

Eu preciso de um programa CLI em Node.js que faça esse trabalho por mim.

Eu vou executar este programa semanalmente em minha própria máquina.

O programa deverá ler um arquivo de entrada em JSON no seguinte formato:


```json
[
  {
    "start": "2025-03-10",
    "end": "2025-03-14",
    "firefighters": [
      {
        "name": "Diogo Cezar",
        "team": "Cloud",
        "discord": "diogo.batista.v3"
      },
      {
        "name": "Adriano",
        "team": "Firmware",
        "discord": "diogo.santos.v3"
      },
    ]
  }
]
```

Essa será a base de dados para que se faça o que é solicitado.

# O que deve ser feito?

- Analisar os dados do JSON;
- Encontrar o registro para a data atual;
- Enviar uma mensagem no canal `📩┃incidentes` informando quais são os bombeiros;
- Ajustar os cargos dos bobeiros, incluindo o cargo `bombeiro`;
- Remover o cargo de bombeiro de todas as outras pessoas;

# Regras

- Utilize um arquivo de `.env` para as credenciais necessárias para o Discord;

# Explicações

- Crie um README.md com um passo a passo para configurar e executar o programa;