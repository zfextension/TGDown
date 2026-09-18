import type { MessageTree } from '../types';

const ptBR: MessageTree = {
  brand: {
    name: 'tgdown',
    subtitle: 'Grátis · Sem limites · Sem conta adicional',
    statusActivating: 'Ativando…',
    statusActive: 'Ativo',
    statusInactive: 'Inativo',
    statusActivatingTitle: 'Processando…',
    statusActiveTitle: 'Telegram Web está ativo. Clique para atualizar a página.',
    statusInactiveTitle:
      'Inativo. Clique para abrir o Telegram Web (K) ou atualizar a aba atual do Telegram.',
    activateHint: 'Clique em «Inativo» no canto superior direito para abrir o Telegram Web',
  },
  media: {
    title: 'Mídias capturadas',
    empty: 'Nenhuma captura ainda',
    emptyHint: 'Navegue por imagens ou reproduza vídeos no Telegram para coletá-los aqui',
    clear: 'Limpar',
    clearConfirm: 'Limpar todos os registros de mídias capturadas?',
    downloadSelected: 'Baixar selecionados ({count})',
    downloadingSelected: 'Baixando…',
    thumbAlt: 'Miniatura',
    cancelDownload: 'Cancelar download',
    copyLink: 'Copiar link de download',
    download: 'Baixar',
    retryDownload: 'Tentar download novamente',
    taskLoading: 'Preparando…',
    taskDownloading: 'Baixando {percent}%',
    taskDone: 'Concluído',
    taskCancelled: 'Cancelado — toque para tentar novamente',
    taskError: 'Falha no download — toque para tentar novamente',
    blobAlert:
      'Links blob exigem que a aba do Telegram permaneça aberta e ativa.',
  },
  footer: {
    howToUse: 'Como usar',
    contact: 'Fale conosco',
  },
  tabs: {
    label: 'Modo de download',
    batch: 'Download em lote',
    manual: 'Download manual',
  },
  manualGuide: {
    eyebrow: 'Download manual',
    title: 'Baixe uma foto ou vídeo',
    subtitle: 'Use o botão de download exibido diretamente nas mensagens de mídia do Telegram.',
    exampleButton: 'Baixar vídeo',
    stepOneTitle: 'Abra um chat do Telegram',
    stepOneDesc: 'Encontre a mensagem de foto ou vídeo que deseja salvar.',
    stepTwoTitle: 'Visualize a mídia',
    stepTwoDesc: 'Passe o cursor sobre uma foto ou reproduza um vídeo para exibir o botão.',
    stepThreeTitle: 'Clique em Baixar',
    stepThreeDesc: 'O arquivo será salvo na pasta de downloads do navegador.',
    cta: 'Ver guia completo',
  },
  settings: {
    language: 'Idioma',
    languageAuto: 'Automático (navegador)',
  },
  context: {
    detecting: 'Detectando…',
    notOnTg: 'Não está no Telegram Web',
    active: 'Telegram Web · Ativo',
    batchTitle: 'Download em lote',
    batchHint: 'Pesquise mídias na barra lateral para ativar',
    batchReady: 'Pronto — download em lote disponível na lista de chats',
  },
  modal: {
    close: 'Fechar',
    largeFile: {
      title: 'Arquivo grande detectado',
      sizeMB: 'Cerca de {size} MB',
      durationMin: 'Cerca de {minutes} min',
      desc:
        '{meta}<br />Arquivos grandes podem ser lentos ou falhar no navegador.<br />Continuar?',
      noRemind: 'Não lembrar novamente',
      browserDownload: 'Continuar download',
    },
    reviewInvite: {
      title: 'Você poderia deixar uma avaliação carinhosa?',
      desc:
        'Você já concluiu <strong>{count}</strong> downloads com o tgdown. Se ele economizou seu tempo, uma avaliação sincera significaria muito para nós e ajuda a manter esta ferramenta gratuita melhorando. 🙏',
      rateNow: 'Deixar avaliação',
      noThanks: 'Agora não',
    },
    toast: {
      done: 'Download concluído!',
    },
  },
  content: {
    downloadDoneToast: '',
    networkError: 'Erro de rede — verifique sua conexão e tente novamente.',
    downloadFailed: 'Falha no download',
    noDownloadUrl: 'Não foi possível obter a URL de download',
    handleDownloadFailed: 'Falha ao processar o download',
    cannotOpenVideo: 'Não foi possível abrir o vídeo',
    noVideoUrl: 'Não foi possível obter a URL do vídeo — reproduza-o primeiro no chat',
    batchSelected: '{count} selecionados',
  },
  button: {
    downloadTitle: 'Baixar',
    waiting: 'Aguardando…',
    fetching: 'Obtendo vídeo…',
    downloading: 'Baixando {percent}%',
    done: 'Download concluído',
    failed: 'Falha no download',
  },
  stories: {
    downloadTitle: 'Baixar Story atual',
  },
};

export default ptBR;
