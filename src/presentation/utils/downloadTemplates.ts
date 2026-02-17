import JSZip from 'jszip';
import { saveAs } from 'file-saver';

interface TemplateManifest {
  files: string[];
}

/**
 * Downloads all template files from public/templates/,
 * bundles them into a single .zip, and triggers a save-as dialog.
 */
export async function downloadTemplatesZip(): Promise<void> {
  // 1. Fetch the manifest to know which files exist
  const manifestRes = await fetch('/templates/manifest.json');
  if (!manifestRes.ok) {
    throw new Error('Não foi possível carregar a lista de templates.');
  }
  const manifest: TemplateManifest = await manifestRes.json();

  if (manifest.files.length === 0) {
    throw new Error('Nenhum template disponível para download.');
  }

  // 2. Fetch all template files in parallel
  const zip = new JSZip();

  const fetches = manifest.files.map(async fileName => {
    const res = await fetch(`/templates/${fileName}`);
    if (!res.ok) {
      throw new Error(`Erro ao carregar template: ${fileName}`);
    }
    const blob = await res.blob();
    zip.file(fileName, blob);
  });

  await Promise.all(fetches);

  // 3. Generate the zip and trigger browser save dialog
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  saveAs(zipBlob, 'mw_templates.zip');
}
