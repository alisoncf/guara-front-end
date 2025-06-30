<template>
  <q-page class="q-pa-md">
    <div class="main-container">

      <!-- Usamos um q-card para agrupar o conteúdo textual de forma organizada -->
      <q-card flat bordered class="q-pa-lg">
        <!-- Cabeçalho da Seção -->
        <q-card-section>
          <h1 class="text-h4 text-weight-bold text-grey-9">
            Sobre a Plataforma Guará Digital
          </h1>
          <p class="text-subtitle1 text-grey-7 q-mt-sm">
            Conectando passado, presente e futuro através do conhecimento.
          </p>
        </q-card-section>

        <q-separator />

        <!-- Conteúdo Principal -->
        <q-card-section class="prose">
          <p>
            A plataforma <strong>Guará Digital</strong> é uma iniciativa inovadora dedicada à preservação, organização e disseminação de acervos culturais e científicos. Nosso objetivo é criar um ecossistema digital onde o conhecimento não é apenas armazenado, mas também interconectado, permitindo que pesquisadores, estudantes e o público em geral explorem as ricas relações entre documentos, objetos, personagens históricos e eventos.
          </p>
          <p>
            Utilizando tecnologias de web semântica e grafos de conhecimento, transformamos coleções estáticas em redes de informação dinâmicas. Isso significa que, ao visualizar um item do acervo, você pode descobrir instantaneamente suas conexões com outros itens, contextos históricos e produções relacionadas, enriquecendo profundamente a experiência de pesquisa e aprendizado.
          </p>
          <h5 class="text-h5 text-weight-medium q-mt-lg">Nossa Missão</h5>
          <p>
            Nossa missão é democratizar o acesso ao patrimônio cultural e científico, fornecendo ferramentas que não apenas exibem informações, mas que também revelam os fios invisíveis que as conectam. Acreditamos que, ao entender essas conexões, podemos gerar novas perspectivas e insights sobre nossa história e cultura.
          </p>
        </q-card-section>
      </q-card>

    </div>
  </q-page>
</template>

<script setup>
defineOptions({
  name: 'SobrePage'
});
</script>

<style lang="scss" scoped>
/*
  Classes de estilo para o texto, melhorando a legibilidade.
  A classe 'prose' é um conceito comum para aplicar estilos a um
  bloco de texto renderizado.
*/
.prose {
  max-width: 80ch; /* Limita a largura do texto para melhor leitura */
}
.prose p {
  line-height: 1.6;
  font-size: 1.1rem;
  margin-bottom: 1em;
  text-align: justify; /* Adicionado para justificar o texto */
}
</style>
