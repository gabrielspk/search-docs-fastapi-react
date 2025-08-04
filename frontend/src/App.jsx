import { useState } from "react";

function App() {
  const [documentos, setDocumentos] = useState("");
  const [diretorio, setDiretorio] = useState("");
  const [validarFpl, setValidarFpl] = useState(false);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dadosExportacao, setDadosExportacao] = useState({
    documentos_encontrados: [],
    documentos_nao_encontrados: [],
    qtde_arquivos_pesquisados: 0,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const docs = documentos
      .split("\n")
      .map((doc) => doc.trim())
      .filter(Boolean);

    if (!diretorio || docs.length === 0) {
      alert("Preencha todos os campos.");
      return;
    }

    setLoading(true);
    setLogs([]);

    try {
      // Tenta diferentes URLs possíveis
      const possibleUrls = [
        "http://localhost:8000/buscar",
        "http://127.0.0.1:8000/buscar"
      ];

      let res;
      for (const url of possibleUrls) {
        try {
          res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              diretorio,
              documentos: docs,
              validar_fpl: validarFpl
            }),
          });
          if (res.ok) break;
        } catch (err) {
          console.log(`Tentativa falhou para ${url}:`, err);
        }
      }

      if (!res || !res.ok) {
        throw new Error(`Erro HTTP: ${res?.status || 'Sem resposta'}`);
      }

      const data = await res.json();
      setLogs(data.logs);
      setDadosExportacao({
        documentos_encontrados: data.documentos_encontrados,
        documentos_nao_encontrados: data.documentos_nao_encontrados,
        qtde_arquivos_pesquisados: data.qtde_arquivos_pesquisados,
      });
    } catch (error) {
      setLogs([`Erro: ${error.message}`]);
    } finally {
      setLoading(false);
    }
  };

  const handleExportarExcel = async () => {
    if (!dadosExportacao) {
      alert("Faça uma busca antes de exportar.");
      return;
    }

    setLoading(true);

    try {
      const possibleUrls = [
        "http://localhost:8000/exportar",
        "http://127.0.0.1:8000/exportar"
      ];
      let res;

      for (const url of possibleUrls) {
        try {
          res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...dadosExportacao,
              nome_arquivo: "relatorio_processamento.xlsx"
            }),
          });
          if (res.ok) break;
        } catch (err) {
          console.log(`Erro tentando ${url}:`, err);
        } 
      }

      if (!res || !res.ok) throw new Error("Erro ao exportar relatório.");

      const blob = await res.blob();
      const urlBlob = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = urlBlob;
      link.setAttribute("download", "relatorio_processamento.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert("Erro ao exportar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header com gradiente sutil */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Buscador de Documentos
              </h1>
              <p className="text-sm text-gray-600">Realiza busca de documentos dentro de arquivos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
          {/* Formulário */}
          <div className="p-8">
            <div className="space-y-8">
              {/* Campo Diretório */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  </svg>
                  <span>Diretório de Busca</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={diretorio}
                    onChange={(e) => setDiretorio(e.target.value)}
                    placeholder="Ex: C:\Users\nome\Downloads"
                    className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 pl-12 text-gray-900 placeholder-gray-500 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all duration-200 outline-none"
                    required
                  />
                  <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>

              {/* Campo Documentos */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Lista de Documentos</span>
                  <span className="text-xs text-gray-500">(um por linha)</span>
                </label>
                <div className="relative">
                  <textarea
                    value={documentos}
                    onChange={(e) => setDocumentos(e.target.value)}
                    rows="8"
                    className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-500 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all duration-200 outline-none resize-none"
                    placeholder={`XX123456789XX\nYY123456789YY\nZZ123456789ZZ\n\nDigite cada documento em uma linha...`}
                    required
                  />
                  <div className="absolute top-3 right-3 text-xs text-gray-400 bg-white px-2 py-1 rounded-lg border">
                    {documentos.split('\n').filter(line => line.trim()).length} docs
                  </div>
                </div>
              </div>

              {/* Checkbox FPL */}
              <div className="flex items-start space-x-3 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    id="fpl"
                    checked={validarFpl}
                    onChange={(e) => setValidarFpl(e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                  />
                </div>
                <div className="text-sm">
                  <label htmlFor="fpl" className="font-medium text-gray-900 cursor-pointer">
                    Incluir arquivos .FPL na busca
                  </label>
                  <p className="text-gray-600 text-xs mt-1">
                    Ativa a pesquisa em arquivos de formato FPL além dos documentos padrão
                  </p>
                </div>
              </div>

              {/* Botão Submit */}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:hover:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Processando busca...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span>Iniciar Busca</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Resultados */}
          {logs.length > 0 && (
            <div className="border-t border-gray-100 bg-gray-50/30">
              <div className="p-8">
                <div className="flex items-center space-x-2 mb-4">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h2 className="text-lg font-bold text-gray-900">Resultados da Busca</h2>
                  <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    {logs.length} entradas
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="max-h-80 overflow-y-auto">
                    <pre className="p-4 text-sm text-gray-800 font-mono leading-relaxed whitespace-pre-wrap">
                      {logs.join('\n')}
                    </pre>
                  </div>
                </div>

                {/* Ações dos resultados */}
                <div className="flex justify-end space-x-3 mt-4">
                  <button
                    onClick={handleExportarExcel}
                    disabled={loading}
                    className="flex items-center space-x-2 px-4 py-2 text-sm rounded-lg transition-colors text-green-600 hover:text-green-900 hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Baixando...</span>
                      </>
                    ) : (
                      <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Excel</span>
                  </>
                    )}
                  </button>
                  <button
                    onClick={() => navigator.clipboard.writeText(logs.join('\n'))}
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span>Copiar</span>
                  </button>
                  <button
                    onClick={() => setLogs([])}
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>Limpar</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer informativo */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>Pesquisa de documentos • Suporte para múltiplos formatos de arquivo</p>
        </div>
      </div>
    </div>
  );
}

export default App;