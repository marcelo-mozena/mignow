---
description: "Regras e padrões para implementação de campos de auditoria em tabelas com TableV2/TableBlock e páginas dinâmicas integradas com API"
applyTo: "**/*.{tsx,ts}"
---

# Campos de Auditoria - Padrões de Implementação

> ⚠️ **ESCOPO**: Esta instrução aplica-se a implementações de **TableV2/TableBlock** com integração via API e **páginas dinâmicas [id]** consumindo endpoints GET únicos.

Objetivo Principal: Garantir o uso consistente e correto de campos de auditoria em tabelas e páginas dinâmicas, evitando duplicação e mantendo a padronização da Sil Sistemas.

## Princípios Fundamentais

Ao implementar tabelas ou páginas dinâmicas integradas com API, sempre aplicar:

- **Não Duplicação**: Campos de auditoria já são fornecidos automaticamente pela tabela padrão do SDK
- **Padronização**: Utilizar os nomes de campos de auditoria padrão do SDK
- **Integração Correta**: Passar os campos de auditoria apropriados para `useCustomHeader` em páginas dinâmicas
- **Manutenibilidade**: Reduzir redundância de código mantendo a consistência

## 1. Campos de Auditoria - Proibição de Adição Manual

### ⛔ NÃO ADICIONAR MANUALMENTE

Ao implementar **TableV2** ou **TableBlock** com integração via API, **NUNCA adicione manualmente** os seguintes campos:

- `Alterado por`
- `Alterado em`
- `Criado em`
- `Criado por`
- `Modificado em`
- `Modificado por`
- Qualquer campo equivalente de auditoria

### ✅ MOTIVO

Esses campos já são **fornecidos automaticamente** pela tabela padrão do SDK. Adicioná-los manualmente resulta em:

- Duplicação de campos desnecessária
- Inconsistência visual na interface
- Manutenção mais complexa
- Possível conflito de dados

### ❌ EXEMPLO INCORRETO

```typescript
// NÃO FAZER ISSO
const columns = [
  { key: "nome", label: "Nome" },
  { key: "email", label: "Email" },
  { key: "alteradoEm", label: "Alterado em" }, // ❌ Redundante
  { key: "alteradoPor", label: "Alterado por" }, // ❌ Redundante
  { key: "criadoEm", label: "Criado em" }, // ❌ Redundante
  { key: "criadoPor", label: "Criado por" }, // ❌ Redundante
];
```

### ✅ EXEMPLO CORRETO

```typescript
// FAZER ASSIM
const columns = [
  { key: "nome", label: "Nome" },
  { key: "email", label: "Email" },
  // Os campos de auditoria são adicionados automaticamente pelo SDK
];
```

## 2. Páginas Dinâmicas [id] com Integração via API

### Quando Aplicar Esta Regra

Esta regra aplica-se quando:

- A página é **dinâmica** com padrão `[id]`
- Está integrada com **API via endpoint GET único**
- Usa `useCustomHeader` para customizar o header da página

### 📋 Campos Obrigatórios para useCustomHeader

Para páginas dinâmicas integradas com API, é **obrigatório** passar os campos de auditoria para `useCustomHeader`:

- `auditUser` - Usuário que realizou a última modificação
- `auditDate` - Data/hora da última modificação

### ❌ EXEMPLO INCORRETO

```typescript
// NÃO FAZER ISSO
const { data } = useApi<Product>(`/api/products/${id}`);

const headerConfig = {
  title: data?.name,
  // ❌ Faltam os campos de auditoria
};

return <CustomHeader {...headerConfig} />;
```

### ✅ EXEMPLO CORRETO

```typescript
// FAZER ASSIM
const { data } = useApi<Product>(`/api/products/${id}`);

const headerConfig = {
  title: data?.name,
  auditUser: data?.lastModifiedBy,  // ✅ Campo obrigatório
  auditDate: data?.lastModifiedDate, // ✅ Campo obrigatório
};

return <CustomHeader {...headerConfig} />;
```

## 3. Integração de API - Mapeamento de Campos

### Responsabilidade da API

A API **DEVE** retornar os campos de auditoria com os nomes padrão esperados pelo SDK:

```json
{
  "data_criacao": "usuario@example.com",
  "data_alteracao": "2024-01-23T10:30:00Z",
  "usuario_alteracao": "João Batista"
}
```

### Responsabilidade do Frontend

O frontend **deve consumir** esses campos sem modificação:

```typescript
interface Product {
  data_criacao: string; // Do mapeamento da API
  data_alteracao: string; // Do mapeamento da API
  usuario_alteracao: string; // Do mapeamento da API
}
```

### ❌ Não Remapear em Página Dinâmica

Não crie transformações desnecessárias dos dados de auditoria no frontend:

```typescript
// ❌ NÃO FAZER
const customData = {
  ...data,
  lastModifiedBy: data.data_alteracao, // Redundante
  lastModifiedDate: data.usuario_alteracao, // Redundante
};
```

## 4. Checklist de Implementação

Ao implementar tabelas ou páginas dinâmicas, verifique:

### ✅ TableV2 / TableBlock

- [ ] Não adicionei campos de auditoria manualmente na definição de colunas
- [ ] Campos de auditoria são automaticamente exibidos pela tabela padrão
- [ ] Estou consumindo os dados da API sem alterações estruturais

### ✅ Páginas Dinâmicas [id]

- [ ] A página consome um endpoint GET único (`/api/resource/{id}`)
- [ ] Estou usando `useCustomHeader` para customizar o header
- [ ] Estou passando `auditUser` para `useCustomHeader`
- [ ] Estou passando `auditDate` para `useCustomHeader`
- [ ] Os nomes dos campos correspondem ao retorno da API

## Referências

- **TableV2/TableBlock SDK**: Componente padrão fornecido pelo SDK com suporte nativo a campos de auditoria
- **useCustomHeader Hook**: Hook para customização de headers em páginas dinâmicas
- **Padrão de API**: Endpoints devem retornar campos de auditoria nos nomes padrão do SDK
