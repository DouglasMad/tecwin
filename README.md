<!-- "# tecwin"  -->


<!--
ORDEM DE EXECUÇÃO MANUAL:
IMPORTNCM
IMPORTST
APIST
APIPIS
APIPISDEB
DADOSST                       
AJUSTAIPI
AJUSTAST
ATUALIZANCM
AJUSTACST
ATUALIZA 
-->
# Integração de Dados Tributarios 
## Descrição

Este projeto tem como objetivo ler arquivos de ncm e st gerados pela WK, adicionar no banco de dados e atualizar com as informações vindas da tecwin para gerar e atualizar para o WK RADAR com informações tributárias da Tecwin. O processo envolve a geração de um arquivo TXT do WK RADAR, mesclagem com dados tributários da Tecwin e importação das informações atualizadas de volta ao WK RADAR para a empresa Plasser.

## Funcionalidades Principais

* Leitura de arquivos de produtos no formato txt.
* Processamento dos produtos para remover caracteres indesejados e ajustar o formato.
* Inserção eficiente de produtos no banco de dados, utilizando inserções em lote (batch insert).
* Tratamento de erros e uso de logs para monitorar o processo.
* Suporte a operações de reinicialização de tabelas e atualização de status de execução.

# Funcionamento Interno da Aplicação

A aplicação realiza uma série de operações automatizadas e processos internos para garantir que os dados tributários sejam atualizados corretamente. A seguir, explicamos as principais etapas e o fluxo de execução:

## 1. Leitura e Processamento de Arquivos

A primeira etapa do processo é a leitura de arquivos .txt gerados pelo WK RADAR. Esses arquivos contêm informações fiscais e de produtos que precisam ser mescladas com dados adicionais provenientes da Tecwin.

* O sistema processa os arquivos para remover caracteres indesejados, como pontos e vírgulas desnecessários.

* Cada linha do arquivo é dividida em seus componentes principais (código do produto, NCM, nome, unidade de medida, CST, etc.).

* Caso algum produto já esteja registrado no banco de dados, ele não é inserido novamente, evitando duplicações. 

## 2. Inserção no Banco de Dados

Depois de processar os dados, a aplicação realiza a inserção dos produtos no banco de dados MySQL. Para otimizar a performance, a inserção de dados é feita em lotes, utilizando um pool de conexões para gerenciar as operações de forma eficiente.

* Produtos são inseridos na tabela tec_produto, que armazena os dados principais dos produtos.

* Informações tributárias adicionais, como dados de CST, PIS, IPI, e ST, são gravadas em tabelas auxiliares (como tec_stcst, tec_ipi, etc.).

## 3. Atualização e Mesclagem de Dados

Após a inserção inicial, a aplicação faz uma mesclagem entre os dados do WK RADAR e as informações tributárias fornecidas pela Tecwin. Isso envolve:

* Comparação entre os dados do WK e da Tecwin para garantir que todas as informações estejam consistentes.

* Atualização dos registros existentes no banco de dados com os dados mais recentes e precisos de NCM, ST, PIS, IPI, entre outros.

* Caso um produto esteja presente no WK RADAR, mas ausente nas informações da Tecwin, ele será corrigido de acordo com a sua arvore binaria para preservar a consistência.

## 4. Controle de Execução e Status

A aplicação mantém um controle detalhado sobre o status de cada etapa do processo. Isso garante que, em caso de falha ou interrupção, a execução possa ser retomada no ponto correto.

* A tabela execucao_status é usada para armazenar o progresso de cada etapa do processo. Isso permite verificar, a qualquer momento, em que ponto a execução se encontra.

* Logs detalhados são gerados durante toda a execução, registrando eventos importantes e quaisquer erros encontrados. Isso facilita o diagnóstico de problemas e o acompanhamento do progresso.

## 5. Reinicialização de Tabelas

Antes de cada nova execução, o sistema pode realizar a reinicialização de algumas tabelas, como tec_produto, tec_stcst, e outras. Isso garante que os dados desatualizados sejam removidos e que o banco esteja pronto para a inserção de novas informações.

# 6. Exportação e Geração de Arquivos Atualizados

Depois que os dados são processados e mesclados, a aplicação gera um arquivo atualizado para ser importado novamente no WK RADAR. Esse arquivo contém as informações fiscais completas, prontas para uso na empresa Plasser.

## Uso

Ao iniciar a aplicação você poderá agendar um horario para inicio da aplicação, esse horario se repetira todos os dias enquando não for atualizado por algum usuário.
O horário agendado ira se repetir todos os dias e continuara executando.

Ao abrir a aplicação ira para essa tela: 

![Main Page](img/Tecwin_home.png)

Ao clicar no botao no centro da pagina abrira um menu de navegação lateral, em que podera escolher entre a configuração de horario e os status do serviço rodando :

![Nav Menu](img/navbar.png)

A tela de configuração voce pode configurar o horario que deseja a aplicação seja executada:

![Configuration hour](img/configHora.png)

A tela seguinte você pode acompanhar o andamento da aplicação em execução:

![Status](img/status.png)


## Tecnologias Utilizadas

[![My Skills](https://skillicons.dev/icons?i=js,html,css,nodejs,electron,mysql)](https://skillicons.dev)