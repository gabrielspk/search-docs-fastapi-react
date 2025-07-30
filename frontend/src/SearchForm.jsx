import { useState } from "react";

function SearchForm({ onBuscar }) {
  const [termo, setTermo] = useState("");
  const [diretorio, setDiretorio] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onBuscar(termo, diretorio);
  };

  const handleDiretorioChange = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      // Extrai o caminho base da primeira pasta
      const fullPath = files[0].webkitRelativePath;
      const baseDir = fullPath.split("/")[0]; // Em Windows pode precisar adaptar
      setDiretorio(`${baseDir}`);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Termo de busca:</label>
        <input
          type="text"
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          required
        />
      </div>

      <div>
        <label>Selecione uma pasta:</label><br />
        <input
          type="file"
          webkitdirectory="true"
          directory=""
          onChange={handleDiretorioChange}
        />
      </div>

      <div>
        <label>Ou insira manualmente:</label>
        <input
          type="text"
          placeholder="Ex: C:\\Users\\gabriel.ferreira\\Downloads"
          value={diretorio}
          onChange={(e) => setDiretorio(e.target.value)}
        />
      </div>

      <button type="submit">Buscar</button>
    </form>
  );
}

export default SearchForm;