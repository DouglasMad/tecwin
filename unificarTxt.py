def processar_arquivo(arquivo, conjunto_unico):
    with open(arquivo, 'r', encoding='ISO-8859-1', errors='ignore') as f:
        for linha in f:
            conjunto_unico.add(linha.strip())  # Adiciona a linha ao conjunto, removendo espaços em branco

# Diretório dos arquivos
diretorio = r'C:\Users\felli\OneDrive\Documentos\tecwin docs'

# Caminhos completos dos arquivos
arquivo1 = f'{diretorio}\\tecwinncm1.txt'
arquivo2 = f'{diretorio}\\tecwinncm2.txt'
arquivo_saida = f'{diretorio}\\tecwinncm.txt'

# Passo 1: Criar um conjunto vazio para armazenar as linhas únicas
itens_unicos = set()

# Passo 2: Processar os arquivos grandes
processar_arquivo(arquivo1, itens_unicos)
processar_arquivo(arquivo2, itens_unicos)

# Passo 3: Escrever as linhas únicas em um novo arquivo
with open(arquivo_saida, 'w', encoding='ISO-8859-1', errors='ignore') as outfile:
    for item in itens_unicos:
        outfile.write(item + '\n')

print(f"Processamento concluído! Itens únicos salvos em '{arquivo_saida}'.")
