# Gw2 Event Timer

[![English](https://img.shields.io/badge/Read%20in-English-1f6feb?style=for-the-badge)](README.md)

Versão 1.0.1.

Página de horários de chefes e metas do Guild Wars 2, com um painel opcional da conta. Abre no navegador. O relógio é o do aparelho de quem está olhando. Não tem banco de dados, não tem login do site e não tem etapa de compilação.

O host só entrega os arquivos da pasta `site`. Depois que esses arquivos carregam, a página é uma ferramenta local no computador dessa pessoa. Ela não envia eventos, favoritos, alertas nem a chave da API para a máquina que entregou a página, e não liga de volta para lugar nenhum deste projeto. O host que entrega os arquivos, seja o seu servidor ou o Cloudflare Pages, vê o IP de quem visita, como qualquer servidor web vê.

O timer de eventos lê `site/data.js` e guarda favoritos, alertas e concluídos no navegador. Ele mesmo não faz nenhum pedido de rede. O painel da conta, só se alguém colar uma chave, chama `https://api.guildwars2.com` direto desse navegador. Os ícones dos itens e os links da wiki abertos no painel também vêm da ArenaNet, não deste projeto. O mesmo limite está escrito no topo de `site/index.html`, `site/app.js` e `site/account.js`.

Copiar a pasta `site` basta para continuar usando o timer sem servidor nenhum: abra o `index.html` dessa pasta, ou sirva a pasta com qualquer servidor de arquivo estático. O "salvar página completa" do navegador é menos confiável, porque o navegador reescreve os caminhos e pode deixar um arquivo de fora. O painel da conta continua precisando da internet dessa pessoa até a ArenaNet. Remover o servidor de origem não para uma cópia que já tenha os arquivos.

Qualquer pessoa pode clonar e usar este projeto. Se for reutilizar, publicar um fork ou usar como base de outra ferramenta, a única coisa pedida é mencionar este projeto como inspiração ou como o fork de origem.

Se o timer ajudou, dá para mandar um mimo no Guild Wars 2 para a conta **Bresleywil.2384**, ou pagar um café.

[![Sponsor](https://img.shields.io/badge/Sponsor-%E2%9D%A4-ea4aaa?style=for-the-badge)](https://github.com/sponsors/wilbresley)

**Pix, para o Brasil.** Escaneie o código no aplicativo do banco e escolha o valor. O bloco embaixo do código tem o botão de copiar do GitHub.

<img src="site/assets/pix-qr.png" alt="QR code do Pix" width="240">

```text
2ca8568d-6bf0-454c-ba65-e2fbbca52057
```

## O que você precisa

- [Git](https://git-scm.com/downloads)
- [Docker Desktop](https://docs.docker.com/get-docker/) no Windows ou no macOS, ou Docker Engine mais o plugin Compose no Linux

O Docker precisa estar aberto antes dos comandos abaixo. No Windows, abra o Docker Desktop e espere ele ficar verde.

## Subir no seu computador

Copie e cole, um bloco de cada vez.

```bash
git clone https://github.com/wilbresley/gw2-event-timer.git
cd gw2-event-timer
docker compose up -d
```

Abra [http://localhost:8094](http://localhost:8094).

O mesmo resultado sai de um atalho, já dentro da pasta do projeto:

- Windows, no PowerShell: `.\start.ps1`
- Linux e macOS: `chmod +x start.sh && ./start.sh`

Para ver se subiu:

```bash
docker compose ps
```

A coluna de estado deve mostrar o container em execução. O nome dele é `gw2-event-timer`.

Para parar, sem apagar a pasta:

```bash
docker compose down
```

Para subir de novo depois de parar:

```bash
docker compose up -d
```

## Trocar a porta

O arquivo `docker-compose.yml` publica a porta 8094 da máquina na porta 80 de dentro do container:

```yaml
ports:
  - "8094:80"
```

Se o 8094 já estiver ocupado, troque só o número da esquerda. Exemplo, para usar 8080:

```yaml
ports:
  - "8080:80"
```

Salve o arquivo e rode de novo:

```bash
docker compose up -d
```

A página passa a abrir em `http://localhost:8080`. O número da direita, `80`, fica como está.

## Atualizar uma cópia que já está no ar

Entre na pasta do projeto e puxe a versão nova. Os arquivos da página são montados direto da pasta, então não é preciso construir uma imagem.

```bash
cd gw2-event-timer
git pull
docker compose up -d
```

Recarregue o navegador. O endereço continua o mesmo.

Se o `git pull` reclamar que o histórico foi reescrito, não force nada sem saber o que está fazendo. O caminho seguro é guardar a pasta atual com outro nome e clonar de novo:

```bash
cd ..
mv gw2-event-timer gw2-event-timer-old
git clone https://github.com/wilbresley/gw2-event-timer.git
cd gw2-event-timer
docker compose up -d
```

No Windows, no PowerShell, o `mv` também renomeia a pasta.

## Colocar no Cloudflare Pages

A página é estática: não tem banco de dados, não tem etapa de compilação e não tem código de servidor. Por isso ela pode ser servida por um host estático em vez de uma máquina em casa, e o timer continua funcionando com o seu computador desligado.

O Cloudflare Pages é o host recomendado aqui, porque o domínio já usa Cloudflare e porque o Pages respeita o arquivo `_headers`. O GitHub Pages não: ele ignora o `_headers` e não oferece nenhuma forma de definir cabeçalhos HTTP, então o site perderia a política de segurança lá.

1. No painel da Cloudflare, abra **Workers & Pages**, depois **Create**, depois **Pages**, depois **Connect to Git**.
2. Escolha o repositório `gw2-event-timer` e o branch `main`.
3. Framework preset: **None**. Build command: deixe vazio. Build output directory: `site`.
4. Salve e publique. A Cloudflare mostra um endereço tipo `gw2-event-timer.pages.dev`.
5. Quando estiver bom, abra a aba **Custom domains** do projeto e adicione o domínio, por exemplo `gw2.bresley.win`. A Cloudflare cria o registro de DNS e o certificado.

Publicar passa a ser um `git push` no `main`. Nada além disso.

O `site/_headers` carrega a política de segurança, as regras de tipo de conteúdo e o cache. Ele é o equivalente no Pages dos cabeçalhos do `nginx.conf`, e os dois ficam no repositório: um para o Pages, outro para o container.

Os arquivos do Docker continuam também. Rodar o container na sua máquina ou num servidor continua funcionando, e é o caminho para usar a página offline ou sem um terceiro na frente.

**O que muda para quem visita:** no Pages, a Cloudflare entrega os arquivos em vez da sua máquina, então a Cloudflare vê o IP de quem visita. No caminho do container, só o seu servidor vê. A página continua não fazendo nenhum pedido por conta própria, e o painel da conta continua falando só com `api.guildwars2.com`.

## Subir num servidor Debian

Estes passos valem para um Debian limpo, com acesso de administrador. Troque o usuário e o caminho se a máquina já tiver um padrão. Os comandos abaixo usam `sudo` quando a tarefa pede root.

### 1. Instalar Git e Docker

```bash
sudo apt update
sudo apt install -y git ca-certificates curl
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker "$USER"
```

Saia da sessão e entre de novo, para o grupo `docker` valer. Confira:

```bash
docker version
docker compose version
```

Os dois comandos precisam imprimir um número de versão, sem erro de permissão.

### 2. Baixar o projeto e ligar

```bash
git clone https://github.com/wilbresley/gw2-event-timer.git
cd gw2-event-timer
docker compose up -d
docker compose ps
```

Na própria máquina do servidor:

```text
http://IP-DO-SERVIDOR:8094
```

De outro computador na mesma rede, use o IP dessa máquina no lugar de `localhost`.

Se o servidor tiver firewall, libere só a porta que você escolheu:

```bash
sudo apt install -y ufw
sudo ufw allow 8094/tcp
sudo ufw status
```

Não rode `ufw enable` se você ainda não liberou o SSH. Sem a porta 22 aberta, a sessão remota cai.

### 3. Colocar atrás de um proxy, se quiser um domínio

O container já responde em HTTP na porta publicada. Um proxy na frente, Nginx ou Caddy, pode terminar o HTTPS e encaminhar para `127.0.0.1:8094`. Este repositório não traz certificado nem domínio. Exemplo mínimo de site no Nginx do host, sem TLS:

```nginx
server {
    listen 80;
    server_name timer.example.com;

    location / {
        proxy_pass http://127.0.0.1:8094;
    }
}
```

Troque `timer.example.com` pelo nome que aponta para esse servidor. O TLS fica a cargo do proxy que você já usa.

### 4. Atualizar o servidor

```bash
cd gw2-event-timer
git pull
docker compose up -d
```

O `restart: unless-stopped` do Compose sobe o container de novo quando a máquina reinicia, desde que o serviço do Docker também suba com o sistema.

## O que a página faz

O topo fica parado. A lista rola. Numa janela larga o topo mostra o nome, o relógio do aparelho e o fuso, a busca, o som, Account, GitHub, Sponsor e Pix. Quando existe uma chave salva neste navegador, uma bolinha no topo mostra o estado da última leitura da conta: verde sólida quando deu certo, azul piscando enquanto atualiza, vermelha sólida quando nada foi atualizado e amarela sólida quando só uma parte deu certo.

Abaixo de cerca de 900 px a barra fica com o logo, o nome menor e a hora no fim dessa linha quando cabe. A busca vira um ícone até ser aberta. O som continua um ícone. O botão de menu guarda Account, GitHub, Sponsor, Pix, as ferramentas de coleta marcadas numa linha e os filtros de região. As filas ficam numa linha que rola para o lado.

As filas são Active, Next 10 min, Done, Favorites e Alerts. Os filtros de conteúdo são Main, Bosses, Metas e as regiões: Core Tyria, Heart of Thorns, Path of Fire, Icebrood Saga, End of Dragons, Secrets of the Obscure, Janthir Wilds e Visions of Eternity. Dá para marcar mais de um. A busca pelo nome entra junto.

Em cada evento:

- **Copy teleport** copia o código de chat. O navegador não move o personagem.
- A estrela guarda favorito.
- O sino liga o alerta daquele evento.
- A marca de "já fiz" zera no reset do jogo, meia-noite UTC. Favoritos e alertas ficam.

O reset aparece no rodapé no fuso do aparelho. Não há seletor de fuso. Com o relógio do sistema em automático, a página já mostra o horário local.

Alguns metas avisam antes, para dar tempo de achar mapa. É estimativa de jogador, não um pré-evento oficial:

| Evento | Aviso |
| --- | --- |
| Chak Gerent | 20 minutos antes |
| Octovine | 15 minutos antes |
| Dragon's Stand | 15 minutos antes do reset do mapa |

**Som** abre um painel pequeno. Som ligado e som desligado ficam nesse painel. Preparar, 10 min e Começou têm um botão cada. Um clique sobe a repetição de 1 até 5, e o clique seguinte volta para 1. Um navegador novo começa em 2, 3 e 5. A escolha fica neste navegador. A tela verde permanece pelo tempo dessas repetições. Um toque na tela fecha e corta o som.

A página não pede permissão de notificação e não manda aviso do sistema. O aviso é um arquivo de áudio tocado pela página. O primeiro clique em qualquer lugar da visita libera o navegador para tocar depois. A partir daí, o aviso toca com o som da página ligado, inclusive com a aba atrás. Fica mudo quando o som da página está desligado, quando a aba está mutada ou quando o computador está mutado. Os arquivos estão em `site/assets/sounds/`:

| Momento | Arquivo |
| --- | --- |
| Preparar | `prep.mp3` |
| Em 10 min | `soon.mp3` |
| Começou | `start.mp3` |

Avisos do mesmo tipo compartilham uma tela. Tipos diferentes entram numa fila: primeiro quem começou, depois os de 10 minutos, por último o preparar.

A largura da janela muda o número de colunas da lista: 1 até 1199 px, 2 a partir de 1200, 3 a partir de 1900, 4 a partir de 2560, 5 a partir de 3440 e 6 a partir de 3840.

## Painel da conta

O botão **Account** abre um painel no mesmo navegador. A pessoa cola uma chave criada em [account.arena.net/applications](https://account.arena.net/applications). A chave fica em `localStorage`, neste site, neste navegador. Outro navegador ou outro computador pede a chave de novo. **Forget Account** apaga a chave desse navegador.

As consultas partem do navegador dessa pessoa direto para `https://api.guildwars2.com`. Este container não faz proxy dessas chamadas e não guarda a chave. Ícones vindos de `render.guildwars2.com` não entram na conta de pedidos da API.

Os menus, nesta ordem, são Summary, Legendary, Ascended, Inventory, Characters, Tools, Bosses, Wallet, Unlocks, Action House, PvP, WvW, Progress e Guilds. O painel mostra o que a API devolve e redesenha o menu aberto quando uma leitura termina. Não é preciso recarregar a página.

À esquerda de **Forget Account** ficam quatro botões:

- **Clear this menu's filters** limpa os filtros do menu aberto. Em Characters, volta ao primeiro personagem da lista, ao build 1 e ao equipamento 1.
- **Clear filters on all menus** limpa os filtros de todos os menus, com o mesmo retorno em Characters.
- **Update this menu from the API** lê de novo só o menu aberto.
- **Update all menus from the API** lê a conta de novo. Esse botão espera 60 segundos entre um uso e outro.

**Legendary** fica acima de Ascended e lista o que a conta tem de raridade Legendary. Os filtros são All, Weapons, Armor, Accessories, Relics e Items. O subfiltro aparece só dentro da categoria correspondente. O peso Light, Medium ou Heavy só combina com peça de armadura.

**Ascended** tem Weapons, Armor, Accessories e Items. Não há filtro de relíquia ascended, porque essa raridade não existe, e não há filtro de materiais. O peso só aparece quando Armor está selecionado. Os filtros de arma, aqui e em Legendary, incluem longbow e shortbow. A API grava esses tipos como LongBow e ShortBow; a página trata as duas grafias como o mesmo arco, então um arco ascended ou legendary não fica de fora do filtro.

**Inventory** separa Bank, Shared Slot, Materials e cada personagem. Cada aba do banco é uma grade de 10 colunas por 3 linhas. O modo agrupado do banco também fica em 10 colunas. O inventário compartilhado fica em 10 colunas e mostra a quantidade de espaços que a API devolve, sem completar além disso. Os materiais seguem as categorias oficiais da API, na ordem oficial, e listam o que está guardado. Uma categoria vazia continua na lista. A API não informa o tamanho desbloqueado do armazém de materiais, então a página não inventa esse número. O seletor de colunas muda só as bolsas do personagem. O nome de cada personagem nesse filtro usa a cor da classe.

**Characters** mostra as skills 1 a 5 das armas equipadas, mais cura, utilities e elite. Não há skills de F1 a F5. No elementalist, cada elemento mostra a skill daquele elemento na arma equipada. No ranger, aparecem só os pets equipados. Na revenant, cada herói equipado tem a própria barra de cura e utilities, desenhada ao lado de uma linha de arma só para o alinhamento visual. A arma não escolhe essas skills.

**Tools** separa ferramentas infinitas e limitadas. Dá para rastrear uma ferramenta infinita de cada tipo, e **Clear tracked tools** tira esse rastreio do topo. Numa janela estreita as três ferramentas ficam numa linha dentro do menu. Entre as infinitas e as limitadas entram só os glyphs de ferramenta, soltos ou encaixados numa ferramenta. Runas, sigilos e os outros upgrades não entram. Clicar num glyph abre onde ele está.

**Bosses** marca o que a conta já fez. O chefe que também existe no timer tem **Copy teleport**, com o mesmo código de chat do evento.

**Guilds** mostra o nome, o nível e a quantidade de membros.

A página não calcula atributos de combate. Se a API não manda o número, o painel não inventa.

O navegador segura um cache local em IndexedDB para não baixar de novo catálogos que mudam pouco, como itens, skins e receitas. A primeira abertura de uma conta grande demora mais. As seguintes usam o que já foi salvo nesse navegador.

Há um teto de 600 pedidos por minuto no próprio navegador, para ficar dentro do limite público da ArenaNet. A conta se atualiza sozinha a cada 10 minutos, as ferramentas a cada 5 minutos e os chefes da conta a cada hora. Se a API da ArenaNet não responde, o painel fecha e o timer de eventos continua.

## Como o horário é calculado

Os ciclos fixos estão em `site/data.js`. A conta começa na meia-noite UTC, no mesmo critério da tabela pública da wiki, e o navegador mostra esse instante no fuso do aparelho.

A agenda não se atualiza sozinha. Se um horário fixo mudar no jogo, `site/data.js` precisa ser atualizado e a página publicada de novo. Drizzlewood Coast não entra: esse mapa não tem horário fixo nessa tabela.

Nada do timer é enviado a um servidor além da própria página. Favoritos, alertas e concluídos ficam no armazenamento local do navegador.

## Mapa dos arquivos

| Arquivo | Função |
| --- | --- |
| `docker-compose.yml` | Sobe o Nginx e publica a porta 8094 |
| `nginx.conf` | Entrega a página, comprime os arquivos de texto e manda os cabeçalhos de segurança |
| `start.ps1`, `start.sh` | Atalho para `docker compose up -d` |
| `VERSION` | Número desta versão: 1.0.1 |
| `README.md` | Documentação em inglês |
| `README.pt-BR.md` | Esta documentação |
| `site/` | HTML, CSS, JavaScript e a agenda |
| `site/index.html` | Casca da página |
| `site/version.js` | O único lugar onde o número da versão está escrito para a página |
| `site/app.js` | Timer, filtros, favoritos, alertas e som |
| `site/app.css` | Visual do timer e a bolinha de estado da conta |
| `site/data.js` | Horários fixos e códigos de teleporte |
| `site/account.js` | Painel da conta, carregado só quando alguém abre Account |
| `site/account.css` | Visual do painel da conta |
| `site/_headers` | Cabeçalhos de segurança e cache, lidos pelo Cloudflare Pages |
| `site/assets/` | Ícone da página, ícone do inventário compartilhado e os sons |

A imagem usada é `nginx:1.30-alpine`. Ela não é construída neste repositório. O Compose só monta `site` em `/usr/share/nginx/html` e `nginx.conf` em `/etc/nginx/conf.d/default.conf`, os dois só para leitura.

O `nginx.conf` comprime os arquivos de texto, manda `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` e um `Content-Security-Policy`, e responde arquivo inexistente com 404 de verdade em vez da página. A política libera os arquivos da própria página, a API em `api.guildwars2.com`, os ícones dos itens em `render.guildwars2.com` e o worker que mantém o relógio andando em aba de segundo plano.

O `site/account.js` tem uns 200 KB e só é baixado por quem abre Account. Um navegador que já tem uma chave salva carrega ele na abertura, porque as ferramentas do topo vêm dele.

## Quando algo não abre

**A página não carrega.** Confira se o Docker está aberto e se o container está de pé:

```bash
docker compose ps
docker compose logs
```

**A porta está ocupada.** O log cita `address already in use`. Troque o número da esquerda em `docker-compose.yml`, como na seção da porta, e rode `docker compose up -d` de novo.

**O celular na mesma rede não abre `localhost`.** `localhost` é a própria máquina. No celular, use o IP do computador onde o Docker está rodando, com a mesma porta. Exemplo: `http://192.168.0.20:8094`.

**A conta não carrega e aparece aviso de API.** A ArenaNet pode estar em manutenção. O timer de eventos não depende dessa API e continua. Tente o painel de novo mais tarde.

**A chave foi colada e nada muda.** A chave precisa das permissões da conta que o painel lê, como account, characters, inventories e unlocks. Uma chave sem permissão volta vazia ou com erro naquela seção. **Forget Account** limpa a chave errada para colar outra.

**Atualizei os arquivos e o navegador mostra a versão velha.** Recarregue a página. O Nginx manda `Cache-Control: no-cache`. Se ainda assim parecer antigo, faça um recarregamento forçado do navegador.
