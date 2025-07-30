<template>
  <q-page class="q-pa-md">
    <div class="q-gutter-md">
      <div class="text-h6">Alunos Sem Turma</div>
      <div
        class="row q-gutter-sm drop-zone"
        @dragover.prevent
        @drop="(event) => onDrop(event, null)"
      >
        <div
          v-for="aluno in alunosSemTurma"
          :key="aluno.id"
          class="q-card q-pa-sm bg-grey-2 text-dark draggable"
          draggable="true"
          @dragstart="onDragStart(aluno)"
        >
          {{ aluno.nome }}
        </div>
      </div>

      <div class="text-h6 q-mt-xl">Turmas</div>
      <div class="row q-col-gutter-md">
        <div v-for="turma in turmas" :key="turma.id" class="col-3">
          <q-card class="q-pa-sm bg-blue-1 text-dark">
            <q-card-section class="text-bold text-subtitle1">
              {{ turma.nome }}
            </q-card-section>

            <div
              class="drop-zone"
              @dragover.prevent
              @drop="(event) => onDrop(event, turma)"
            >
              <div
                v-for="aluno in turma.alunos"
                :key="aluno.id"
                class="q-card q-ma-xs bg-white text-dark draggable"
                draggable="true"
                @dragstart="onDragStart(aluno, turma)"
              >
                <q-card-section>{{ aluno.nome }}</q-card-section>
              </div>
            </div>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue';

const draggedAluno = ref(null);
const draggedFromTurma = ref(null);

const alunosSemTurma = ref([
  { id: 1, nome: 'Ana' },
  { id: 2, nome: 'Carlos' },
  { id: 3, nome: 'Beatriz' },
]);

const turmas = ref([
  { id: 101, nome: 'Turma A', alunos: [] },
  { id: 102, nome: 'Turma B', alunos: [] },
  { id: 103, nome: 'Turma C', alunos: [] },
  { id: 104, nome: 'Turma D', alunos: [] },
]);

function onDragStart(aluno, fromTurma = null) {
  draggedAluno.value = aluno;
  draggedFromTurma.value = fromTurma;
}

function onDrop(event, targetTurma) {
  event.preventDefault();

  if (!draggedAluno.value) return;

  // Remove da origem
  if (draggedFromTurma.value) {
    draggedFromTurma.value.alunos = draggedFromTurma.value.alunos.filter(
      (a) => a.id !== draggedAluno.value.id
    );
  } else {
    alunosSemTurma.value = alunosSemTurma.value.filter(
      (a) => a.id !== draggedAluno.value.id
    );
  }

  // Adiciona ao destino
  if (targetTurma) {
    targetTurma.alunos.push(draggedAluno.value);
  } else {
    alunosSemTurma.value.push(draggedAluno.value);
  }

  // Limpa as referências
  draggedAluno.value = null;
  draggedFromTurma.value = null;
}
</script>

<style scoped>
.drop-zone {
  min-height: 100px;
  padding: 8px;
  background-color: #d7dade;
  border-radius: 8px;
}
.draggable {
  cursor: grab;
}
</style>
