---
description: "Orientações para trabalhar com projetos .NET Framework. Inclui estrutura de projeto, versão da linguagem C#, gerenciamento de NuGet e melhores práticas."
applyTo: "**/*.csproj, **/*.cs"
---

# Desenvolvimento .NET Framework

## Requisitos de Build e Compilação

- Sempre use `msbuild /t:rebuild` para construir a solução ou projetos em vez de `dotnet build`

## Gerenciamento de Arquivos de Projeto

### Estrutura de Projeto Estilo Não-SDK

Projetos .NET Framework usam o formato de projeto legado, que difere significativamente dos projetos modernos estilo SDK:

- **Inclusão Explícita de Arquivos**: Todos os novos arquivos de código-fonte **DEVEM** ser adicionados explicitamente ao arquivo de projeto (`.csproj`) usando um elemento `<Compile>`

  - Projetos .NET Framework não incluem arquivos no diretório automaticamente como projetos estilo SDK
  - Exemplo: `<Compile Include="Caminho\Para\NovoArquivo.cs" />`

- **Sem Imports Implícitos**: Diferente de projetos estilo SDK, projetos .NET Framework não importam `namespaces` ou `assemblies` comuns automaticamente

- **Configuração de Build**: Contém seções `<PropertyGroup>` explícitas para configurações de Debug/Release

- **Caminhos de Saída**: Definições explícitas de `<OutputPath>` e `<IntermediateOutputPath>`

- **Target Framework**: Usa `<TargetFrameworkVersion>` em vez de `<TargetFramework>`
  - Exemplo: `<TargetFrameworkVersion>v4.7.2</TargetFrameworkVersion>`

## Gerenciamento de Pacotes NuGet

- Instalar e atualizar pacotes NuGet em projetos .NET Framework é uma tarefa complexa que requer alterações coordenadas em múltiplos arquivos. Portanto, **não tente instalar ou atualizar pacotes NuGet** neste projeto.
- Em vez disso, se forem necessárias alterações nas referências do NuGet, peça ao usuário para instalar ou atualizar os pacotes NuGet usando o Gerenciador de Pacotes NuGet do Visual Studio ou o console do gerenciador de pacotes do Visual Studio.
- Ao recomendar pacotes NuGet, garanta que eles sejam compatíveis com .NET Framework ou .NET Standard 2.0 (não apenas .NET Core ou .NET 5+).

## A Versão da Linguagem C# é 7.3

- Este projeto está limitado apenas aos recursos do C# 7.3. Por favor, evite usar:

### Recursos do C# 8.0+ (NÃO SUPORTADOS):

- Declarações `using` (`using var stream = ...`)
- Instruções `await using` (`await using var resource = ...`)
- `Switch expressions` (`variable switch { ... }`)
- Atribuição de coalescência nula (`??=`)
- Operadores de `range` e `index` (`array[1..^1]`, `array[^1]`)
- Métodos de interface padrão
- Membros `readonly` em `structs`
- Funções locais estáticas
- `Nullable reference types` (`string?`, `#nullable enable`)

### Recursos do C# 9.0+ (NÃO SUPORTADOS):

- `Records` (`public record Person(string Name)`)
- Propriedades `init-only` (`{ get; init; }`)
- Programas `top-level` (programa sem método Main)
- Melhorias no `pattern matching`
- Expressões `new` com tipo de destino (`List<string> list = new()`)

### Recursos do C# 10+ (NÃO SUPORTADOS):

- Instruções `global using`
- `Namespaces` com escopo de arquivo
- `Record structs`
- Membros `required`

### Use em Vez Disso (Compatível com C# 7.3):

- Instruções `using` tradicionais com chaves
- Instruções `switch` em vez de `switch expressions`
- Verificações de nulo explícitas em vez de atribuição de coalescência nula
- Fatiamento de `array` com indexação manual
- Classes abstratas ou interfaces em vez de métodos de interface padrão

## Considerações de Ambiente (ambiente Windows)

- Use caminhos no estilo Windows com barras invertidas (ex., `C:\caminho\para\arquivo.cs`)
- Use comandos apropriados para Windows ao sugerir operações de terminal
- Considere comportamentos específicos do Windows ao trabalhar com operações do sistema de arquivos

## Armadilhas Comuns e Melhores Práticas do .NET Framework

### Padrões Async/Await

- **ConfigureAwait(false)**: Sempre use `ConfigureAwait(false)` em código de biblioteca para evitar `deadlocks`:
  ```csharp
  var result = await SomeAsyncMethod().ConfigureAwait(false);
  ```
- **Evite `sync-over-async`**: Não use `.Result` ou `.Wait()` ou `.GetAwaiter().GetResult()`. Esses padrões `sync-over-async` podem levar a `deadlocks` e baixo desempenho. Sempre use `await` para chamadas assíncronas.

### Manipulação de DateTime

- **Use DateTimeOffset para timestamps**: Prefira `DateTimeOffset` em vez de `DateTime` para pontos de tempo absolutos
- **Especifique DateTimeKind**: Ao usar `DateTime`, sempre especifique `DateTimeKind.Utc` ou `DateTimeKind.Local`
- **Formatação ciente da cultura**: Use `CultureInfo.InvariantCulture` para serialização/parsing

### Operações de String

- **StringBuilder para concatenação**: Use `StringBuilder` para múltiplas concatenações de `string`
- **StringComparison**: Sempre especifique `StringComparison` para operações de `string`:
  ```csharp
  string.Equals(other, StringComparison.OrdinalIgnoreCase)
  ```

### Gerenciamento de Memória

- **Padrão Dispose**: Implemente `IDisposable` corretamente para recursos não gerenciados
- **Instruções using**: Sempre envolva objetos `IDisposable` em instruções `using`
- **Evite o Large Object Heap (LOH)**: Mantenha objetos abaixo de 85KB para evitar alocação no LOH

### Configuração

- **Use ConfigurationManager**: Acesse as configurações do aplicativo através de `ConfigurationManager.AppSettings`
- **Connection strings**: Armazene na seção `<connectionStrings>`, não em `<appSettings>`
- **Transformações**: Use transformações de web.config/app.config para configurações específicas do ambiente

### Tratamento de Exceções

- **Exceções específicas**: Capture tipos de exceção específicos, não o genérico `Exception`
- **Não engula exceções**: Sempre registre ou relance exceções apropriadamente
- **Use `using` para recursos descartáveis**: Garante a limpeza adequada mesmo quando ocorrem exceções

### Considerações de Performance

- **Evite boxing**: Esteja ciente de `boxing`/`unboxing` com `value types` e `generics`
- **String interning**: Use `string.Intern()` criteriosamente para `strings` usadas com frequência
- **Inicialização preguiçosa (Lazy initialization)**: Use `Lazy<T>` para criação de objetos caros
- **Evite reflection em `hot paths`**: Armazene em cache objetos `MethodInfo`, `PropertyInfo` quando possível
