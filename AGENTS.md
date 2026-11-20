# Notas para quem mexer neste projeto depois

Este arquivo é para qualquer pessoa ou IA que altere o projeto mais tarde. Leia antes de editar. Ele registra decisões que são fáceis de desfazer por acidente, porque o código não explica sozinho por que elas estão ali.

Nada de dado pessoal entra neste repositório: sem endereço de casa, sem IP privado, sem chave de API e sem domínio real do mantenedor. Os exemplos usam `example.com` e `192.168.0.20` de propósito. Mantenha assim. Os arquivos de documentação e as mensagens de commit são em português; só o texto da interface da página é em inglês.

A única identificação pública é o nome de conta do jogo e a chave Pix, que estão no rodapé e na janela do Pix de propósito: são o crédito do projeto e o jeito de receber presente. Não acrescente nada além disso, e não troque esses dois por dados de outra pessoa.

## Onde a página roda

A mesma pasta `site` é servida de dois lugares, e os dois precisam continuar funcionando:

1. **Cloudflare Pages** serve o site público. Um push no branch `main` publica em cerca de um minuto. É o caminho que os visitantes usam.
2. **Um container** (`nginx:1.30-alpine`, veja `docker-compose.yml`) serve a mesma pasta na porta 8094. É o caminho para usar a página offline, numa rede local, ou atrás de um proxy que o mantenedor controle. Não é o caminho público.

Nada na página sabe qual dos dois está servindo. Todo caminho no HTML, no CSS e no JavaScript é relativo. Não introduza caminho absoluto, nome de host fixo ou número de porta: isso quebraria um dos dois.

## Os dois arquivos de cabeçalho, e por que são dois

Os cabeçalhos de segurança ficam em dois arquivos que precisam andar juntos:

| Arquivo | Quem lê | Formato |
| --- | --- | --- |
| `site/_headers` | Cloudflare Pages | texto simples, o caminho e os cabeçalhos indentados embaixo |
| `nginx.conf` | o container | diretivas `add_header` do nginx |

O Cloudflare Pages aplica o `_headers` e ignora o `nginx.conf`. O container aplica o `nginx.conf` e entregaria o `_headers` como arquivo para baixar, se ele estivesse acessível. **Se você mudar a Content-Security-Policy em um, mude no outro.** Uma política diferente nos dois é pior do que nenhuma, porque os ambientes divergem e só um é testado.

A política atual é pequena de propósito. Ela permite os arquivos da própria página, `api.guildwars2.com` para as leituras da conta, `render.guildwars2.com` para os ícones dos itens, `blob:` para o worker que mantém o relógio andando em aba de segundo plano, e `data:` para as máscaras do CSS. Se você adicionar um script de terceiro, uma fonte de CDN ou uma imagem de outro host, a política precisa ser ampliada nos dois arquivos, senão o navegador bloqueia sem avisar na tela.

O `nginx.conf` também responde 404 de verdade quando falta um `.js`, `.css`, `.png` ou `.mp3`. O Cloudflare Pages só faz isso se existir um `site/404.html` na raiz: **sem esse arquivo, o Pages acha que o projeto é uma aplicação de página única e responde a qualquer caminho inexistente com o `index.html` e status 200.** Isso já escondeu um arquivo renomeado atrás de uma página HTML. **Não apague o `site/404.html`.**

## Publicar

Um push no `main` é a publicação. Não existe etapa de compilação: o comando de build é `exit 0` e o diretório de saída é `site`. Qualquer coisa que exija uma ferramenta de build quebraria o Pages.

**Suba o número do `?v=` quando um arquivo mudar.** O `site/index.html` referencia `app.css?v=34`, `account.js?v=38`, `assets/icon.png?v=16` e assim por diante. O `site/_headers` guarda `/assets/*` por um dia, então o navegador pode manter um arquivo antigo depois de uma publicação. Se você alterar o `site/app.js`, aumente o `?v=` dele no `index.html` no mesmo commit. O mesmo vale para o CSS, o ícone e os sons.

O número da versão está escrito em `site/version.js` e em nenhum outro lugar da página. O `VERSION` na raiz do repositório é a cópia legível que a documentação cita. Mude os dois juntos, senão o rodapé e os READMEs discordam.

## Coisas que parecem erradas e estão certas

- **O `site/account.js` não está no `index.html`.** O `app.js` carrega ele com uma tag `script` na primeira vez que alguém clica em Account, ou na abertura se já existe chave salva (as ferramentas do topo vêm dele). São cerca de 200 KB; carregar isso para todo visitante era desperdício. A Content-Security-Policy permite porque `script-src` inclui `'self'`.
- **Nada chama `Notification.requestPermission`.** Foi removido de propósito. O aviso é um arquivo de áudio comum que a página toca, e as regras de reprodução automática do navegador exigem um clique na página por visita antes de liberar o som. Não traga permissão de notificação de volta como atalho.
- **O dicionário em português foi removido.** O `lang` é fixo em `"en"` e a interface é só em inglês. Um dicionário em português pela metade ficava no `app.js` e no `account.js`, sem uso. Não recoloque um sem também criar um seletor de idioma e garantir que todas as chaves existam nos dois idiomas.
- **As leituras de `localStorage` passam por `readJSON`, `readList`, `readObject` e `readFlag`.** Eles engolem um valor corrompido em vez de lançar erro. Ler `localStorage` direto na abertura foi suficiente para deixar a página em branco uma vez; não desfaça isso.
- **Os formatadores de `Intl` são guardados** no mapa `formatters`. Criar um por segundo e por card é medível. Não volte a escrever `new Intl.DateTimeFormat` dentro de um caminho de desenho.
- **Só existe um laço de tique.** O worker existe para o relógio continuar andando em aba de segundo plano; o `setInterval` só é iniciado se o worker não puder ser criado. Rodar os dois dobra o trabalho sem ganho.
- **O relógio não mostra segundos.** Ele mostra hora e minuto, então pode parecer parado por até um minuto. Se achar que a página morreu, olhe a contagem de um card: essa muda a cada segundo.
- **`app.css` e `account.css` são arquivos separados.** O `account.css` é pequeno e carrega com a página; o JavaScript que usa ele, não.

## O que esta página promete e o que não promete

A página não faz nenhum pedido de rede por conta própria. Ela lê o `site/data.js`, guarda favoritos, alertas e concluídos no `localStorage`, e não liga para casa. O painel da conta é o único caminho de rede: fala com `api.guildwars2.com` direto do navegador de quem visita, e só depois que alguém cola uma chave. A chave fica no `localStorage` em `gw2-token` e não vai para outro lugar.

O host que entrega os arquivos vê o IP de quem visita, como qualquer servidor web. Isso vale para o Cloudflare Pages e para o container. Mantenha a documentação honesta sobre isso se mudar a hospedagem.

## Regras de layout que valem não quebrar

O cabeçalho é uma grade de três colunas em janela larga e uma barra compacta abaixo de 900 px. Em 900 px ou menos, o JavaScript move Account, GitHub, Sponsor, Pix, as ferramentas de coleta e os filtros de região para o menu, e devolve tudo para as posições gravadas quando a janela alarga. O botão de som, o ícone de busca e o botão do menu ficam na barra.

O painel de som é posicionado em relação ao cabeçalho, não em relação ao botão, para não cobrir os botões que caem numa segunda linha entre 900 e 1100 px. Ele foi movido para lá depois de cobrir o botão Sponsor. Teste em torno de 320, 390, 940 e 1440 px de largura antes de mexer nessa área.

O controle do Sponsor é um `button` com `id="heart"` e `class="heart-link"`, e o endereço é montado no JavaScript. Não renomeie para uma classe ou um `href` com a palavra "sponsor", e não escreva `github.com/sponsors` no HTML: bloqueadores de anúncio escondem esses elementos e o botão desaparece para quem usa um.

## Como conferir uma alteração

Não existe suíte de testes. Antes de considerar uma mudança pronta:

1. Abra a página e confirme que o relógio está andando (a contagem de um card muda a cada segundo).
2. Clique num filtro, num favorito, no botão de som e no menu.
3. Abra a conta e confirme que o painel carrega.
4. Estreite a janela até a largura de celular e confirme que nada passa para o lado.
5. Olhe os cabeçalhos da resposta: a Content-Security-Policy, o `X-Content-Type-Options`, o `Referrer-Policy` e o `Permissions-Policy` precisam estar presentes. Num host estático, essa é a única forma de perceber que uma política parou de ser aplicada sem avisar.
6. Peça um arquivo que não existe e confirme que a resposta é 404, não a página HTML.
