# backend/app/search_logic.py
from concurrent.futures import ThreadPoolExecutor
import re
import os
import time
from utils.utilitarios import detectar_encoding
from utils.utilitarios import incrementar_nome_arquivo

def pesquisar_documentos(diretorio_atual, extensoes_descartadas, validacao_nomenclatura, documentos):
    documentos_encontrados = []
    documentos_nao_encontrados = set(documentos)
    qtde_arquivos_pesquisados = 0

    regex_documentos = re.compile('|'.join(re.escape(doc) for doc in documentos))

    def processar_arquivo(file_path):
        nonlocal qtde_arquivos_pesquisados
        try:
            encoding_detectado = detectar_encoding(file_path)
            with open(file_path, encoding=encoding_detectado, errors="ignore") as f:
                conteudo = f.read()
            documentos_encontrados_no_arquivo = set(regex_documentos.findall(conteudo))
            for documento in documentos_encontrados_no_arquivo:
                documentos_encontrados.append([documento, os.path.basename(file_path)])
                documentos_nao_encontrados.discard(documento)
            qtde_arquivos_pesquisados += 1
        except Exception as e:
            print(f"Erro ao ler o arquivo {file_path}: {e}")

    with ThreadPoolExecutor() as executor:
        futures = []
        for root, _, files in os.walk(diretorio_atual):
            for file in files:
                if not any(file.endswith(ext) for ext in extensoes_descartadas) and \
                   not any(file.startswith(validacao) for validacao in validacao_nomenclatura):
                    file_path = os.path.join(root, file)
                    futures.append(executor.submit(processar_arquivo, file_path))
        for future in futures:
            future.result()

    return (
        documentos_encontrados,
        documentos_nao_encontrados,
        qtde_arquivos_pesquisados,
        len(documentos_nao_encontrados),
        len(documentos_encontrados)
    )

def executar_pesquisa_documentos(diretorio_atual, validar_fpl, documentos, log_callback):
    inicio = time.time()
    extensoes_descartadas = (".fpl", ".zip", ".ini", ".pdf", ".xlsx")
    if validar_fpl:
        extensoes_descartadas = extensoes_descartadas[1:]

    validacao_nomenclatura = []

    documentos_encontrados, documentos_nao_encontrados, qtde_arquivos_pesquisados, qtde_documentos_nao_encontrados, qtde_documentos_encontrados = pesquisar_documentos(
        diretorio_atual, extensoes_descartadas, validacao_nomenclatura, documentos)

    tempo_execucao = time.time() - inicio
    minutos, segundos = divmod(tempo_execucao, 60)
    tempo_formatado = f'{int(minutos):02}:{int(segundos):02}'

    log_callback(f'Quantidade de arquivos pesquisados: {qtde_arquivos_pesquisados}')
    log_callback(f'Total de documentos não encontrados em arquivo: {qtde_documentos_nao_encontrados}')
    log_callback(f'Total de documentos encontrados em arquivo: {qtde_documentos_encontrados}')
    log_callback(f'Tempo de execução: {tempo_formatado}')