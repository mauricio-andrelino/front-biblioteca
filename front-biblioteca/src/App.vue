
<script setup>
import { ref, onMounted } from 'vue'

const API_URL = 'http://localhost:3000/api/livros'

const livros = ref([])
const titulo = ref('')
const autor = ref('')
const ano = ref('')
const editandoId = ref(null)
const mensagem = ref('')
const erro = ref('')
const carregando = ref(false)

async function carregarLivros() {
  carregando.value = true
  erro.value = ''

  try {
    const resposta = await fetch(API_URL)

    if (!resposta.ok) {
      throw new Error('Não foi possível carregar os livros.')
    }

    livros.value = await resposta.json()
  } catch {
    erro.value = 'Não foi possível conectar à API. Verifique se o backend está rodando.'
  } finally {
    carregando.value = false
  }
}

async function salvarLivro() {
  mensagem.value = ''
  erro.value = ''

  if (!titulo.value.trim() || !autor.value.trim()) {
    erro.value = 'Preencha o título e o autor.'
    return
  }

  const dados = {
    titulo: titulo.value.trim(),
    autor: autor.value.trim(),
    ano: ano.value ? Number(ano.value) : null
  }

  const editando = editandoId.value !== null
  const url = editando
    ? `${API_URL}/${editandoId.value}`
    : API_URL

  try {
    const resposta = await fetch(url, {
      method: editando ? 'PUT' : 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dados)
    })

    const resultado = await resposta.json()

    if (!resposta.ok) {
      throw new Error(resultado.erro || 'Erro ao salvar o livro.')
    }

    mensagem.value = editando
      ? 'Livro atualizado com sucesso!'
      : 'Livro cadastrado com sucesso!'

    limparFormulario()
    await carregarLivros()
  } catch (e) {
    erro.value = e.message || 'Erro ao comunicar com a API.'
  }
}

function editarLivro(livro) {
  titulo.value = livro.titulo
  autor.value = livro.autor
  ano.value = livro.ano ?? ''
  editandoId.value = livro.id
  mensagem.value = ''
  erro.value = ''

  window.scrollTo({ top: 0, behavior: 'smooth' })
}

async function excluirLivro(id) {
  if (!confirm('Deseja realmente excluir este livro?')) return

  mensagem.value = ''
  erro.value = ''

  try {
    const resposta = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE'
    })

    if (!resposta.ok) {
      let resultado = {}
      try {
        resultado = await resposta.json()
      } catch {}

      throw new Error(resultado.erro || 'Erro ao excluir o livro.')
    }

    mensagem.value = 'Livro excluído com sucesso!'
    await carregarLivros()
  } catch (e) {
    erro.value = e.message || 'Erro ao comunicar com a API.'
  }
}

function limparFormulario() {
  titulo.value = ''
  autor.value = ''
  ano.value = ''
  editandoId.value = null
}

onMounted(carregarLivros)
</script>

<template>
  <main class="pagina">
    <header class="cabecalho">
      <div class="marca">📚 Biblioteca</div>
      <span class="status">Sistema de gerenciamento</span>
    </header>

    <section class="conteudo">
      <div class="introducao">
        <p class="subtitulo">SUA BIBLIOTECA DIGITAL</p>
        <h1>Gerencie seus livros</h1>
        <p>Cadastre, consulte, edite e organize sua coleção.</p>
      </div>

      <section class="painel formulario">
        <h2>
          {{ editandoId !== null ? 'Editar livro' : 'Cadastrar novo livro' }}
        </h2>

        <form @submit.prevent="salvarLivro">
          <label for="titulo">Título do livro</label>
          <input
            id="titulo"
            v-model="titulo"
            type="text"
            placeholder="Ex.: Dom Casmurro"
            required
          />

          <label for="autor">Autor</label>
          <input
            id="autor"
            v-model="autor"
            type="text"
            placeholder="Ex.: Machado de Assis"
            required
          />

          <label for="ano">Ano de publicação</label>
          <input
            id="ano"
            v-model="ano"
            type="number"
            placeholder="Ex.: 1899"
          />

          <div class="acoes-formulario">
            <button class="botao principal" type="submit">
              {{ editandoId !== null ? 'Salvar alterações' : 'Cadastrar livro' }}
            </button>

            <button
              v-if="editandoId !== null"
              class="botao secundario"
              type="button"
              @click="limparFormulario"
            >
              Cancelar
            </button>
          </div>
        </form>

        <p v-if="mensagem" class="aviso sucesso">{{ mensagem }}</p>
        <p v-if="erro" class="aviso falha">{{ erro }}</p>
      </section>

      <section class="secao-livros">
        <div class="titulo-lista">
          <div>
            <h2>Acervo de livros</h2>
            <p>Livros cadastrados no sistema</p>
          </div>

          <span class="contador">{{ livros.length }} livros</span>
        </div>

        <div v-if="carregando" class="estado">
          Carregando livros...
        </div>

        <div v-else-if="livros.length === 0" class="estado">
          <span class="icone-vazio">📖</span>
          <h3>Nenhum livro cadastrado</h3>
          <p>Use o formulário acima para adicionar o primeiro livro.</p>
        </div>

        <div v-else class="lista-livros">
          <article
            v-for="livro in livros"
            :key="livro.id"
            class="livro"
          >
            <div class="capa">📕</div>

            <div class="informacoes">
              <h3>{{ livro.titulo }}</h3>
              <p>{{ livro.autor }}</p>
              <span>
                Publicado em {{ livro.ano || 'Ano não informado' }}
              </span>
            </div>

            <div class="acoes-livro">
              <button
                class="botao secundario"
                type="button"
                @click="editarLivro(livro)"
              >
                Editar
              </button>

              <button
                class="botao perigo"
                type="button"
                @click="excluirLivro(livro.id)"
              >
                Excluir
              </button>
            </div>
          </article>
        </div>
      </section>
    </section>

    <footer>
      Biblioteca Digital · Desenvolvido com Vue.js e Express
    </footer>
  </main>
</template>

<style>
:root {
  font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  color: #202b3c;
  background: #f4f6fa;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-width: 320px;
  background: #f4f6fa;
  color: #202b3c;
}

button,
input {
  font: inherit;
}

.pagina {
  min-height: 100vh;
}

.cabecalho {
  min-height: 72px;
  padding: 18px max(5%, calc((100% - 1100px) / 2));
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  background: #fff;
  border-bottom: 1px solid #e4e8ef;
}

.marca {
  font-size: 21px;
  font-weight: 800;
  color: #253d75;
}

.status {
  font-size: 13px;
  color: #68758a;
}

.conteudo {
  width: min(100% - 32px, 900px);
  margin: 0 auto;
  padding: 44px 0;
}

.introducao {
  margin-bottom: 28px;
}

.subtitulo {
  color: #4263a9;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 1.5px;
}

h1 {
  margin: 8px 0;
  color: #202b3c;
  font-size: clamp(28px, 5vw, 38px);
  letter-spacing: -1px;
}

.introducao > p:last-child,
.titulo-lista p {
  color: #68758a;
  line-height: 1.6;
}

.painel {
  background: #fff;
  border: 1px solid #e5e9f0;
  border-radius: 16px;
  padding: 26px;
  box-shadow: 0 8px 28px #172b4d08;
}

h2 {
  margin-top: 0;
  color: #202b3c;
  font-size: 20px;
}

form {
  display: grid;
  gap: 10px;
}

label {
  margin-top: 7px;
  color: #202b3c;
  font-size: 14px;
  font-weight: 650;
}

input {
  width: 100%;
  min-height: 46px;
  padding: 12px 14px;
  border: 1px solid #d7deea;
  border-radius: 9px;
  background: #fff;
  color: #202b3c;
  outline: none;
}

input::placeholder {
  color: #7b8799;
  opacity: 1;
}

input:focus {
  border-color: #4263a9;
  box-shadow: 0 0 0 3px #4263a91a;
}

.acoes-formulario,
.acoes-livro {
  display: flex;
  flex-wrap: wrap;
  gap: 9px;
  margin-top: 10px;
}

.botao {
  border: 0;
  border-radius: 8px;
  padding: 11px 15px;
  font-weight: 650;
  cursor: pointer;
}

.principal {
  color: #fff;
  background: #2f4f91;
}

.principal:hover {
  background: #233d73;
}

.secundario {
  color: #34445f;
  background: #edf1f7;
}

.secundario:hover {
  background: #dfe6f1;
}

.perigo {
  color: #a32d39;
  background: #fff0f0;
}

.perigo:hover {
  background: #ffe0e0;
}

.aviso {
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
}

.sucesso {
  color: #17643a;
  background: #eaf8ef;
}

.falha {
  color: #a32d39;
  background: #fff0f0;
}

.secao-livros {
  margin-top: 38px;
}

.titulo-lista {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
  margin-bottom: 18px;
}

.titulo-lista h2 {
  margin-bottom: 5px;
}

.titulo-lista p {
  margin-top: 0;
  font-size: 14px;
}

.contador {
  padding: 8px 12px;
  border-radius: 20px;
  background: #e7edfa;
  color: #2f4f91;
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
}

.estado {
  padding: 38px 16px;
  text-align: center;
  border: 1px dashed #cbd4e2;
  border-radius: 14px;
  background: #fff;
  color: #68758a;
}

.estado h3 {
  color: #34445f;
}

.icone-vazio {
  font-size: 34px;
}

.lista-livros {
  display: grid;
  gap: 12px;
}

.livro {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px;
  background: #fff;
  border: 1px solid #e5e9f0;
  border-radius: 12px;
}

.capa {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 52px;
  height: 60px;
  border-radius: 8px;
  background: #edf1fa;
  font-size: 26px;
}

.informacoes {
  flex: 1;
  min-width: 0;
}

.informacoes h3 {
  margin: 0 0 5px;
  color: #202b3c;
  overflow-wrap: anywhere;
}

.informacoes p {
  margin: 0 0 7px;
  color: #53627a;
}

.informacoes span {
  color: #7b8799;
  font-size: 12px;
}

.acoes-livro {
  margin-top: 0;
}

footer {
  padding: 24px 16px;
  text-align: center;
  color: #7b8799;
  font-size: 13px;
}

@media (max-width: 600px) {
  .cabecalho {
    align-items: flex-start;
    flex-direction: column;
  }

  .conteudo {
    padding-top: 30px;
  }

  .painel {
    padding: 19px;
  }

  .livro {
    flex-wrap: wrap;
  }

  .acoes-livro {
    width: 100%;
    padding-left: 68px;
  }
}
</style>
