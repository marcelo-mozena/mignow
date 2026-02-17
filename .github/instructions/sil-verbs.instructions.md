---
description: "Padronização de Verbos e Ações do Usuário no Frontend React TypeScript seguindo as diretrizes da Sil Sistemas"
applyTo: "**/*.{tsx,ts}"
---

# Instruções para GitHub Copilot - Padronização de Verbos e Ações

> ⚠️ **ESCOPO**: Esta instrução aplica-se **APENAS** a aplicações frontend em **React com TypeScript**.

Objetivo Principal: Garantir o uso consistente de verbos em português brasileiro (PT-BR) em todas as interfaces do frontend React TypeScript, seguindo os padrões da Sil Sistemas.

## Princípios Fundamentais

Ao gerar código ou sugestões para elementos de interface, sempre aplicar :

- **Consistência**: Mesma ação = mesmo verbo em toda aplicação
- **Clareza**: Verbos autoexplicativos e diretos
- **Familiaridade**: Terminologia reconhecida pelo mercado
- **Simplicidade**: Evitar jargões técnicos desnecessários
- **Localização**: Português brasileiro formal e correto

## Padrões Obrigatórios de Verbos

### Operações CRUD

#### SEMPRE UTILIZAR:

- **Criar** - para novos registros: `"Criar Ordem de Transporte"`
- **Exibir** - para visualização somente leitura: `"Exibir Rota"`
- **Editar** - para modificações: `"Editar Motorista"`
- **Excluir** - para remoção permanente: `"Excluir Veículo"`
- **Salvar** - para persistir dados: `"Salvar Carga"`

#### NUNCA UTILIZAR:

- "Deletar" → Use "Excluir"
- "Apagar" → Use "Excluir"
- "Gravar" → Use "Salvar"
- "Modificar" → Use "Editar"
- "Visualizar" → Use "Exibir"
- "Cadastrar" → Use "Criar"
- "Alterar" → Use "Editar"

### Ações de Fluxo de Trabalho

#### PADRÕES CORRETOS:

- **Aprovar** - para confirmação de ação: `"Aprovar Solicitação de Transporte"`
- **Rejeitar** - para negação: `"Rejeitar Pedido de Frete"`
- **Enviar** - para submeter processamento: `"Enviar para Aprovação"`
- **Devolver** - para retornar ao solicitante: `"Devolver Documento"`
- **Liberar** - para permitir execução: `"Liberar Ordem"`
- **Bloquear** - para impedir alterações: `"Bloquear Cadastro"`
- **Desbloquear** - para permitir alterações: `"Desbloquear Cadastro"`

### Operações de Busca e Filtro

#### UTILIZAR:

- **Pesquisar** - para busca geral
- **Filtrar** - para aplicar filtros
- **Classificar** - para ordenar listas
- **Limpar** - para limpar filtros: `"Limpar Filtros"`
- **Selecionar** - para marcar itens: `"Selecionar Todos"`

#### EVITAR:

- "Buscar" → Use "Pesquisar"

### Navegação e Controle

#### Botões padrão:

- **Voltar** - para retroceder
- **Cancelar** - para desistir de operação
- **Fechar** - para encerrar janela/modal
- **Continuar** - para prosseguir no processo
- **Finalizar** - para concluir wizard
- **Confirmar** - para validar ação
- **Atualizar** - para recarregar dados

#### NUNCA:

- "OK" → Use "Confirmar"
- "Não" → Use "Cancelar"
- "Novo" (como verbo) → Use "Criar Novo"

### Manipulação de Dados

#### PADRÕES:

- **Copiar** - para duplicar: `"Copiar Rota"`
- **Mover** - para relocar: `"Mover Carga"`
- **Agrupar** - para combinar itens: `"Agrupar Entregas"`
- **Desagrupar** - para separar: `"Desagrupar Cargas"`
- **Mesclar** - para unir registros: `"Mesclar Rotas"`
- **Dividir** - para separar registro: `"Dividir Carga"`
- **Adicionar** - para incluir item em lista: `"Adicionar Item"`
- **Remover** - para retirar item de lista: `"Remover Item"`
- **Restaurar** - para recuperar dados: `"Restaurar Versão"`

### Exportação e Compartilhamento

#### VERBOS PADRÃO:

- **Exportar** - para gerar arquivo: `"Exportar para Excel"`
- **Importar** - para carregar dados: `"Importar Dados"`
- **Imprimir** - para gerar impressão: `"Imprimir Manifesto"`
- **Compartilhar** - para enviar link
- **Download** - para baixar arquivo
- **Upload** - para enviar arquivo
- **Anexar** - para incluir anexo: `"Anexar Documento"`

### Ações Específicas de Transporte

#### VOCABULÁRIO ESPECIALIZADO:

- **Agendar** - para programar: `"Agendar Coleta"`
- **Atribuir** - para designar: `"Atribuir Motorista"`
- **Despachar** - para iniciar transporte: `"Despachar Veículo"`
- **Rastrear** - para monitorar: `"Rastrear Carga"`
- **Entregar** - para confirmar entrega: `"Confirmar Entrega"`
- **Coletar** - para realizar coleta: `"Confirmar Coleta"`
- **Roteirizar** - para definir rota: `"Roteirizar Entregas"`
- **Otimizar** - para melhorar rota: `"Otimizar Rota"`

## Estrutura de Botões

### Formato Correto

Sempre usar: `[Verbo]` ou `[Verbo + Substantivo]`

#### EXEMPLOS CORRETOS:

- "Salvar"
- "Criar Ordem"
- "Enviar para Aprovação"
- "Exportar para Excel"

#### EXEMPLOS INCORRETOS:

- "Clique aqui para salvar"
- "Fazer novo cadastro"
- "OK"

### Hierarquia de Botões

| Tipo       | Uso                    | Estilo                   | Exemplos              |
| ---------- | ---------------------- | ------------------------ | --------------------- |
| Primário   | Ação principal da tela | Destaque (cor principal) | Salvar, Criar, Enviar |
| Secundário | Ações complementares   | Neutro                   | Cancelar, Voltar      |
| Destrutivo | Ações irreversíveis    | Alerta (vermelho)        | Excluir               |
| Terciário  | Ações opcionais        | Link/texto               | Exportar, Imprimir    |

### Posicionamento Padrão

- **Formulários**: [Salvar] [Cancelar]
- **Listas**: [Criar] [Filtrar] [Exportar]
- **Modais**: [Confirmar] [Cancelar]
- **Exclusão**: [Excluir] [Cancelar]

## Mensagens de Feedback

### Mensagens de Sucesso

| Ação    | Mensagem Padrão                          |
| ------- | ---------------------------------------- |
| Salvar  | "Registro salvo com sucesso"             |
| Criar   | "Ordem de Transporte criada com sucesso" |
| Excluir | "Registro excluído com sucesso"          |
| Enviar  | "Enviado para aprovação com sucesso"     |
| Aprovar | "Aprovado com sucesso"                   |

### Mensagens de Confirmação

| Ação            | Mensagem Padrão                                                  |
| --------------- | ---------------------------------------------------------------- |
| Excluir         | "Deseja excluir este registro? Esta ação não pode ser desfeita." |
| Cancelar edição | "Deseja descartar as alterações não salvas?"                     |
| Sair            | "Existem alterações não salvas. Deseja sair mesmo assim?"        |

## Distinções Críticas

### Excluir vs. Remover

| Verbo       | Quando Usar                          | Exemplo                                           |
| ----------- | ------------------------------------ | ------------------------------------------------- |
| **Excluir** | Remoção permanente do banco de dados | "Excluir Veículo" (apaga o registro)              |
| **Remover** | Retirar de uma lista ou associação   | "Remover Item da Carga" (item continua existindo) |

### Criar vs. Adicionar

| Verbo         | Quando Usar                      | Exemplo                     |
| ------------- | -------------------------------- | --------------------------- |
| **Criar**     | Gerar um novo registro principal | "Criar Ordem de Transporte" |
| **Adicionar** | Incluir item em lista existente  | "Adicionar Parada na Rota"  |

### Agrupar vs. Mesclar

| Verbo       | Quando Usar                                 | Exemplo                                  |
| ----------- | ------------------------------------------- | ---------------------------------------- |
| **Agrupar** | Juntar itens mantendo identidade individual | "Agrupar Entregas" (cada entrega existe) |
| **Mesclar** | Fundir itens em um único registro           | "Mesclar Rotas" (vira uma rota só)       |

## Termos Proibidos

| ❌ NÃO USAR | ✅ USAR         | Motivo                   |
| ----------- | --------------- | ------------------------ |
| Deletar     | Excluir         | Anglicismo desnecessário |
| Apagar      | Excluir         | Informal                 |
| Gravar      | Salvar          | Padrão do mercado        |
| Modificar   | Editar          | Padronização             |
| Visualizar  | Exibir          | Padrão ERP               |
| Juntar      | Agrupar/Mesclar | Informal                 |
| Botar       | Adicionar       | Coloquial                |
| Tirar       | Remover         | Coloquial                |
| Pegar       | Obter           | Coloquial                |
| Colocar     | Inserir         | Informal                 |
| Cadastrar   | Criar           | Padronização             |
| Alterar     | Editar          | Padronização             |
| Buscar      | Pesquisar       | Padronização             |

## Regras de Geração

Ao sugerir labels, textos de botões ou mensagens:

1. **SEMPRE** usar verbos padronizados em português brasileiro
2. **NUNCA** usar termos coloquiais (tirar, pegar, colocar, botar)
3. **NUNCA** usar anglicismos quando existe equivalente em PT-BR (deletar → excluir)
4. Aplicar hierarquia correta de botões conforme tipo de ação
5. Usar frases verbais completas para clareza
6. Incluir mensagens de confirmação apropriadas para ações destrutivas
7. Seguir distinções entre verbos similares (excluir/remover, criar/adicionar, agrupar/mesclar)

## Lista de Verificação

Antes de aceitar qualquer sugestão, verificar:

- [ ] Todos os verbos voltados ao usuário estão na lista aprovada
- [ ] Nenhum termo proibido está sendo usado
- [ ] Hierarquia de botões corresponde à importância da ação
- [ ] Mensagens de confirmação seguem padrões estabelecidos
- [ ] Distinção entre verbos similares está correta
- [ ] Linguagem está em português brasileiro formal
