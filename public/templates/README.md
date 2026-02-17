# Guia de Uso dos Templates de Importação

Este diretório contém os arquivos de template para importação de dados no SSP Migration Wizard.

## Instruções Gerais

- **Não altere os nomes das colunas** dos arquivos CSV. Os nomes das colunas devem permanecer exatamente como estão nos templates para garantir o correto funcionamento da importação.
- **Valide cuidadosamente os dados** antes de importar. O Migration Wizard pode não realizar todas as validações de negócio necessárias. Dados inconsistentes ou inválidos podem causar falhas ou resultados inesperados na plataforma.
- **Preencha todos os campos obrigatórios** conforme indicado em cada template. Campos obrigatórios não preenchidos podem impedir a importação.
- **Tipos de dados**: Certifique-se de que os valores estejam no formato esperado (por exemplo, campos booleanos como `ativo` devem ser `true` ou `false`).
- **IDs de referência**: Quando um campo exigir um ID (ex: `fabricante_id`), utilize o identificador correto já cadastrado na plataforma.
- **Não adicione, remova ou reordene colunas**. A estrutura do template deve ser mantida.
- **Faça backup dos seus dados** antes de realizar importações em massa.

## Passos para Importação

1. Baixe o template correspondente ao tipo de dado que deseja importar.
2. Preencha o arquivo seguindo as instruções acima.
3. Utilize o botão "Importação de Dados" no Migration Wizard para selecionar o tipo de dado e anexar o arquivo preenchido.
4. Valide os dados antes de confirmar a importação.

Em caso de dúvidas, consulte a equipe de suporte ou a documentação oficial da plataforma.
