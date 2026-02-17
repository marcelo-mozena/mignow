import { toast } from 'sonner';

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).then(
    () => toast.success('Mensagem copiada!', { duration: 1500 }),
    () => toast.error('Falha ao copiar.')
  );
}

export function showErrorToast(status: number, message: string, errorCode?: string) {
  const statusLabel = status > 0 ? `Erro ${status}` : 'Erro de Rede';
  const codeLabel = errorCode ? ` [${errorCode}]` : '';
  const description = `${statusLabel}${codeLabel}`;
  const fullMessage = `[${description}] ${message}`;

  toast.error(message, {
    description,
    duration: 10000,
    action: {
      label: 'Copiar',
      onClick: () => copyToClipboard(fullMessage),
    },
  });
}
