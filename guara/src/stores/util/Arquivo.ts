export class Arquivo {
  private conteudo: BlobPart;
  private nome: string;
  private contentType: string;

  constructor(conteudo: BlobPart, nome: string, mimeType: string) {
    this.conteudo = conteudo;
    this.nome = nome;
    this.contentType = mimeType;
  }

  private crieObjetoBaixavel() {
    // It is necessary to create a new blob object with mime-type explicitly set
    // otherwise only Chrome works like it should
    const blob = new Blob([this.conteudo], { type: this.contentType });

    // For other browsers:
    // Create a link pointing to the ObjectURL containing the blob.
    return window.URL.createObjectURL(blob);
  }

  private crieLink(objetoBaixavel: string): HTMLAnchorElement {
    const link = document.createElement('a');
    link.href = objetoBaixavel;
    link.download = this.nome;
    link.setAttribute('target', '_blank');
    return link;
  }

  private limpeObjeto(objetoBaixavel: string) {
    // For Firefox it is necessary to delay revoking the ObjectURL
    const revoque = () => window.URL.revokeObjectURL(objetoBaixavel);
    setTimeout(revoque, 100);
  }

  baixe() {
    const objetoBaixavel = this.crieObjetoBaixavel();
    this.crieLink(objetoBaixavel).click();
    this.limpeObjeto(objetoBaixavel);
  }

  async obtenhaDataUrl() {
    const blob = new Blob([this.conteudo], { type: this.contentType });
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  }

  obtenhaObjectUrl() {
    return this.crieObjetoBaixavel();
  }
}

export function corrijaContentType(
  nome: string,
  contentTypeOriginal: string | null
) {
  if (
    contentTypeOriginal == 'application/octet-stream' ||
    contentTypeOriginal == null
  ) {
    let contentType;
    const tipos = new Map();
    tipos.set('.jpg', 'image/jpeg');
    tipos.set('.png', 'image/png');
    tipos.set('.pdf', 'application/pdf');
    tipos.forEach((valor, chave) => {
      if (nome.endsWith(chave)) contentType = valor;
    });
    if (contentType) return contentType;
  }
  return contentTypeOriginal ?? '';
}
export const obtenhaNomeDoArquivo = function (caminho_arquivo: string): string {
  const caminho = caminho_arquivo ?? '';

  const [, nome] = caminho.split('/');
  return nome ?? '';
};

export interface ArquivoApi {
  path: string | null;
  chave: string | null;
  hash: string | null;
  conteudo: BlobPart;
  contentType: string | null;
}
