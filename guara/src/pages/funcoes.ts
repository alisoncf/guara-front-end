import { ClasseComum, TreeNode } from './tipos';
import { ref } from 'vue';

export function textoAposUltimoChar(texto: any, char: any): string {
  const ultimaBarraIndex = texto.lastIndexOf(char);
  return ultimaBarraIndex === -1
    ? texto
    : texto.substring(ultimaBarraIndex + 1);
}

export function organiza_arvore(lista: ClasseComum[]): TreeNode[] {
  const arvoreClasses = ref<TreeNode[]>([]);

  lista.sort((a, b) => a.subclassof.localeCompare(b.subclassof));

  lista.forEach((classItem) => {
    if (classItem.subclassof == '-') {
      arvoreClasses.value.push({
        label: classItem.nome_curto,
        icon: 'home',
        displayLabel: classItem.nome_curto,
        children: [],
        classData: classItem,
      });
    }
  });

  lista.forEach((classItem) => {
    if (classItem.subclassof !== '-') {
      const parent = findParentNode(arvoreClasses.value, classItem.mae_curta);
      if (parent) {
        parent.children.push({
          label: classItem.nome_curto,
          icon: 'description',
          displayLabel: classItem.label,
          classData: classItem,
          children: [],
        });
        return arvoreClasses;
      }
    }
  });
  return arvoreClasses.value;
}
export function findParentNode(nodes: TreeNode[], parentLabel: string): any {
  for (const node of nodes) {
    if (node.label === parentLabel) {
      return node;
    }
    if (node.children && node.children.length > 0) {
      const result = findParentNode(node.children, parentLabel);
      if (result) {
        return result;
      }
    }
  }
  return null;
}
export function encontrarClassePorLabel(
  label: string,
  listaClassesMae: ClasseComum[]
): ClasseComum {
  const data = listaClassesMae.find((classe) => classe.nome_curto === label);
  if (data) {
    return data;
  } else {
    return {
      uri: '',
      label: '',
      description: '',
      subclassof: '',
      mae_curta: '',
      nome_curto: '',
    };
  }
}
export type Funcao = () => void;
export type FuncaoComCallback = (fn: Funcao) => void;

export function mapearPropriedade(uri: string) {
  const mapa = {
    'http://purl.org/dc/terms/description': 'Descrição',
    'http://purl.org/dc/terms/title': 'Título/nome',
    'http://purl.org/dc/terms/creator': 'Autor',
    'http://purl.org/dc/terms/date': 'Data',
    'http://purl.org/dc/terms/subject': 'Assunto',
    'http://purl.org/dc/terms/abstract': 'Resumo',
    'http://schema.org/associatedMedia': 'Midia',
  };

  return mapa[uri] || uri; // Retorna o valor original se não encontrar no mapa
}
