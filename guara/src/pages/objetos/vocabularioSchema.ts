// Peça genérica e compartilhada da feature de "Outros dados" (campos do
// guaraonto que variam por tipo). Domínio-agnóstica de propósito: tanto
// vocabularioFisico.ts (por tipoFisico) quanto vocabularioDimensional.ts
// (por Dimensao - Pessoa/Lugar/Evento/Tempo) usam este mesmo tipo e o
// mesmo filtro; só a LISTA de campos muda de um domínio pro outro.

export type TipoDadoCampo = 'texto' | 'numero' | 'data' | 'textarea';

export interface CampoVocabulario {
  // Chave curta usada como key no bag objeto.vocabulario (ex.: "isbn").
  chave: string;
  // Rótulo mostrado no formulário.
  rotulo: string;
  // URI da propriedade no guaraonto - é o que vai ser enviado ao backend
  // quando ele souber interpretar isso como triplas RDF.
  propriedadeUri: string;
  tipoDado: TipoDadoCampo;
  // Quais "tipos" (tipoFisico ou Dimensao.tipo, dependendo do domínio)
  // usam esse campo. Um campo pode se aplicar a mais de um tipo.
  aplicaA: string[];
  ajuda?: string;
}

// Filtra um schema pelos tipos aplicáveis, sem repetir campo cuja
// "aplicaA" bata com mais de um tipo selecionado.
export function filtrarCamposPorTipo(
  schema: CampoVocabulario[],
  tipos: string[]
): CampoVocabulario[] {
  const vistos = new Set<string>();
  return schema.filter((campo) => {
    if (!campo.aplicaA.some((tipo) => tipos.includes(tipo))) return false;
    if (vistos.has(campo.chave)) return false;
    vistos.add(campo.chave);
    return true;
  });
}
