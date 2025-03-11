# Fire Chief

Uma ferramenta CLI para gerenciar atribuições do cargo de "bombeiro" no Discord com base em uma programação semanal.

## Visão Geral

Esta aplicação ajuda a gerenciar o cargo de "bombeiro" em um servidor Discord. Ela:

1. Lê um arquivo JSON contendo as atribuições semanais de bombeiros
2. Identifica os bombeiros da semana atual
3. Envia uma mensagem para um canal Discord designado anunciando os bombeiros
4. Atribui o cargo de "bombeiro" aos membros designados
5. Remove o cargo de "bombeiro" de todos os outros membros

## Pré-requisitos

- Node.js (v14 ou superior)
- npm (v6 ou superior)
- Um bot Discord com as seguintes permissões:
  - Gerenciar Cargos
  - Enviar Mensagens
  - Ler Histórico de Mensagens
  - Ver Canais

## Instalação

1. Clone este repositório:
   ```
   git clone <repository-url>
   cd labs-fire-chief
   ```

2. Instale as dependências:
   ```
   npm install
   ```

3. Crie um arquivo `.env` baseado no exemplo:
   ```
   cp .env.example .env
   ```

4. Edite o arquivo `.env` com suas credenciais do Discord (veja a seção "Configuração do arquivo .env" abaixo para instruções detalhadas)

5. (Opcional) Instale a CLI globalmente:
   ```
   npm run link
   ```

## Configuração do arquivo .env

O arquivo `.env` contém as credenciais e IDs necessários para que o bot funcione corretamente. Aqui está como obter cada valor:

### DISCORD_TOKEN

Este é o token de autenticação do seu bot Discord.

1. Acesse o [Portal de Desenvolvedores do Discord](https://discord.com/developers/applications)
2. Clique em "New Application" e dê um nome (ex: "Fire Chief")
3. No menu lateral, clique em "Bot"
4. Clique em "Add Bot" e confirme
5. Na seção "TOKEN", clique em "Reset Token" e confirme
6. Copie o token gerado e cole no arquivo `.env` após `DISCORD_TOKEN=`

**Importante**: Nunca compartilhe este token publicamente. Ele dá acesso completo ao seu bot.

### DISCORD_GUILD_ID

Este é o ID do seu servidor Discord.

1. Abra o Discord e vá para Configurações do Usuário > Avançado
2. Ative o "Modo desenvolvedor"
3. Clique com o botão direito no nome do seu servidor na barra lateral
4. Selecione "Copiar ID"
5. Cole este ID no arquivo `.env` após `DISCORD_GUILD_ID=`

### DISCORD_CHANNEL_ID

Este é o ID do canal onde as mensagens sobre os bombeiros serão enviadas.

1. Com o "Modo desenvolvedor" ativado, clique com o botão direito no canal `📩┃incidentes` 
2. Selecione "Copiar ID"
3. Cole este ID no arquivo `.env` após `DISCORD_CHANNEL_ID=`

### DISCORD_FIREFIGHTER_ROLE_ID

Este é o ID do cargo "bombeiro" que será atribuído aos membros.

1. Vá para as configurações do servidor > Cargos
2. Crie um novo cargo chamado "bombeiro" se ainda não existir
   - Certifique-se de que o bot tenha um cargo com permissões superiores a este cargo
3. Com o "Modo desenvolvedor" ativado, clique com o botão direito no cargo "bombeiro"
4. Selecione "Copiar ID"
5. Cole este ID no arquivo `.env` após `DISCORD_FIREFIGHTER_ROLE_ID=`

## Configuração do Bot Discord

1. Acesse o [Portal de Desenvolvedores do Discord](https://discord.com/developers/applications)
2. Crie uma nova aplicação
3. Navegue até a aba "Bot" e crie um bot
4. Na seção "Privileged Gateway Intents", habilite:
   - Server Members Intent
   - Message Content Intent
5. Copie o token do bot e adicione ao seu arquivo `.env`
6. Use o Gerador de URL OAuth2 para criar um link de convite com as permissões necessárias:
   - Na seção OAuth2 > URL Generator, selecione os seguintes escopos:
     - `bot`
     - `applications.commands`
   - Nas permissões do bot, selecione:
     - Gerenciar Cargos
     - Enviar Mensagens
     - Ler Histórico de Mensagens
     - Ver Canais
   - Copie a URL gerada e cole em seu navegador para adicionar o bot ao servidor
7. Convide o bot para o seu servidor

## Formato do Arquivo de Dados

Crie um arquivo JSON (padrão: `data.json`) com a seguinte estrutura:

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
        "discord": "adriano.santos.v3"
      }
    ]
  }
]
```

Cada entrada representa uma semana com:
- `start`: Data de início (AAAA-MM-DD) - Geralmente uma segunda-feira
- `end`: Data de término (AAAA-MM-DD) - Geralmente uma sexta-feira
- `firefighters`: Array de objetos de bombeiros com:
  - `name`: Nome de exibição da pessoa
  - `team`: Nome da equipe a que pertence
  - `discord`: Nome de usuário do Discord (sem o #0000)

### Dicas para o Arquivo de Dados

- Certifique-se de que as datas não se sobreponham entre diferentes semanas
- O programa identificará automaticamente a semana atual com base na data de hoje
- Você pode adicionar quantas semanas quiser no arquivo
- Recomenda-se manter o arquivo atualizado com várias semanas futuras
- O campo `discord` deve corresponder ao nome de usuário do Discord da pessoa (não o apelido no servidor)

## Uso

### Executando Localmente

```
npm start
```

### Executando com um Arquivo de Dados Personalizado

```
npm start -- --data caminho/para/seu/arquivo.json
```

### Modo de Teste (Sem Alterações no Discord)

```
npm test
```

## Ajuda

```
fire-chief --help
```

## Configuração do Agendamento

O Fire Chief pode ser configurado para executar automaticamente toda segunda-feira e quando o computador iniciar. Siga os passos abaixo para configurar:

### 1. Preparação dos Arquivos

1. Certifique-se de que o arquivo `run-fire-chief.sh` está com permissão de execução:
```bash
chmod +x run-fire-chief.sh
```

2. Configure o arquivo `com.firechief.plist`:
   - Abra o arquivo e substitua:
     - `PATH_TO_SCRIPT` pelo caminho completo onde o projeto está instalado
     - `USER_HOME_PATH` pelo caminho do seu diretório home (ex: /Users/seu_usuario)

3. Copie o arquivo de configuração do launchd:
```bash
cp com.firechief.plist ~/Library/LaunchAgents/
```

### 2. Configuração do Serviço

O serviço está configurado para executar:
- Toda segunda-feira às 9:00
- Quando o computador iniciar (caso tenha perdido a execução da segunda-feira)

Para alterar o horário de execução, modifique os valores no arquivo `com.firechief.plist`:
- `Hour`: Hora de execução (0-23)
- `Minute`: Minuto de execução (0-59)
- `Weekday`: Dia da semana (0 = Domingo, 1 = Segunda, ..., 6 = Sábado)

### 3. Gerenciamento do Serviço

#### Ativar o serviço:
```bash
launchctl load ~/Library/LaunchAgents/com.firechief.plist
```

#### Desativar o serviço:
```bash
launchctl unload ~/Library/LaunchAgents/com.firechief.plist
```

#### Verificar status do serviço:
```bash
launchctl list | grep firechief
```

#### Executar manualmente:
```bash
launchctl start com.firechief
```

### 4. Logs

Os logs são salvos em dois arquivos:
- `fire-chief.out`: Saídas normais do programa
- `fire-chief.err`: Erros e mensagens de debug

Para visualizar os logs:
```bash
# Ver saídas normais
cat fire-chief.out

# Ver erros
cat fire-chief.err
```

### 5. Solução de Problemas

1. Se o serviço não estiver executando:
   - Verifique se o Node.js está instalado e atualizado
   - Confirme se todas as variáveis de ambiente estão configuradas no `.env`
   - Verifique os logs em `fire-chief.err`
   - Confirme se os caminhos no `com.firechief.plist` estão corretos

2. Para reiniciar o serviço após mudanças:
```bash
launchctl unload ~/Library/LaunchAgents/com.firechief.plist && launchctl load ~/Library/LaunchAgents/com.firechief.plist
```

3. Para testar o script manualmente:
```bash
./run-fire-chief.sh
```

### 6. Observações Importantes

- O serviço usa Node.js v20 ou superior
- Certifique-se de que o arquivo `.env` está configurado corretamente
- O bot precisa ter as permissões adequadas no Discord
- O computador precisa estar ligado no momento agendado para a execução
- Todos os caminhos no arquivo plist devem ser absolutos (começando com /) 