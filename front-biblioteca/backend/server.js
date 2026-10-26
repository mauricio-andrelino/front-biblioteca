const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Banco temporário de livros
let livros = [];
let proximoId = 1;

// Rota inicial
app.get("/", (req, res) => {
  res.json({
    mensagem: "API da Biblioteca funcionando!",
  });
});

// Listar livros
app.get("/api/livros", (req, res) => {
  res.json(livros);
});

// Buscar livro por ID
app.get("/api/livros/:id", (req, res) => {
  const id = Number(req.params.id);
  const livro = livros.find((item) => item.id === id);

  if (!livro) {
    return res.status(404).json({
      erro: "Livro não encontrado",
    });
  }

  res.json(livro);
});

// Cadastrar livro
app.post("/api/livros", (req, res) => {
  const { titulo, autor, ano } = req.body;

  if (
    typeof titulo !== "string" ||
    !titulo.trim() ||
    typeof autor !== "string" ||
    !autor.trim()
  ) {
    return res.status(400).json({
      erro: "Título e autor são obrigatórios",
    });
  }

  const livro = {
    id: proximoId++,
    titulo: titulo.trim(),
    autor: autor.trim(),
    ano: ano ?? null,
  };

  livros.push(livro);

  res.status(201).json(livro);
});

// Atualizar livro
app.put("/api/livros/:id", (req, res) => {
  const id = Number(req.params.id);
  const livro = livros.find((item) => item.id === id);

  if (!livro) {
    return res.status(404).json({
      erro: "Livro não encontrado",
    });
  }

  const { titulo, autor, ano } = req.body;

  if (
    typeof titulo !== "string" ||
    !titulo.trim() ||
    typeof autor !== "string" ||
    !autor.trim()
  ) {
    return res.status(400).json({
      erro: "Título e autor são obrigatórios",
    });
  }

  livro.titulo = titulo.trim();
  livro.autor = autor.trim();
  livro.ano = ano ?? null;

  res.json(livro);
});

// Excluir livro
app.delete("/api/livros/:id", (req, res) => {
  const id = Number(req.params.id);
  const indice = livros.findIndex((item) => item.id === id);

  if (indice === -1) {
    return res.status(404).json({
      erro: "Livro não encontrado",
    });
  }

  livros.splice(indice, 1);

  res.json({
    mensagem: "Livro excluído com sucesso",
  });
});

app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`);
});