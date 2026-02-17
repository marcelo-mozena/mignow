import { ipcMain, app } from 'electron';
import * as fs from 'fs';
import * as path from 'path';

export interface EnvOrgData {
  orgs: Array<{
    id: string;
    companies: string[];
  }>;
  userName: string;
  userEmail: string;
  environment: string;
}

export function registerEnvHandlers() {
  ipcMain.handle('env:saveOrgs', async (_, data: EnvOrgData) => {
    try {
      const lines: string[] = [
        `# Gerado automaticamente pelo SSP Migration Wizard`,
        `# ${new Date().toISOString()}`,
        '',
        `SSP_USER_NAME=${data.userName}`,
        `SSP_USER_EMAIL=${data.userEmail}`,
        `SSP_ENVIRONMENT=${data.environment}`,
        '',
      ];

      data.orgs.forEach((org, orgIdx) => {
        lines.push(`SSP_ORG_${orgIdx + 1}_ID=${org.id}`);
        org.companies.forEach((companyId, compIdx) => {
          lines.push(`SSP_ORG_${orgIdx + 1}_COMPANY_${compIdx + 1}_ID=${companyId}`);
        });
        lines.push('');
      });

      const envPath = path.join(app.getPath('userData'), '.env.ssp');
      fs.writeFileSync(envPath, lines.join('\n'), 'utf-8');

      console.log(`[ENV] Saved orgs to ${envPath}`);
      return { success: true, path: envPath };
    } catch (error) {
      console.error('[ENV] Failed to save orgs:', error);
      throw error;
    }
  });
}
