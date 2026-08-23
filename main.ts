import { App, Notice, Plugin, PluginSettingTab, Setting, requestUrl } from 'obsidian';
import { unzipSync, strFromU8 } from 'fflate';

interface SplinterDeployerSettings {
  repo: string;
  token: string;
}

const DEFAULT_SETTINGS: SplinterDeployerSettings = { repo: '', token: '' };

interface GithubReleaseAsset {
  id: number;
  name: string;
}

interface GithubRelease {
  assets: GithubReleaseAsset[];
}

function errMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

export default class SplinterDeployerPlugin extends Plugin {
  settings: SplinterDeployerSettings = DEFAULT_SETTINGS;

  async onload() {
    await this.loadSettings();
    this.addSettingTab(new SplinterDeployerSettingTab(this.app, this));

    this.addCommand({
      id: 'deploy-now',
      name: 'Deploy now',
      callback: () => this.deploy(),
    });

    void this.deploy();
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  async deploy() {
    const { repo, token } = this.settings;
    if (!repo || !repo.includes('/') || !token) {
      new Notice('Splinter Deployer: set "owner/repo" and a PAT in plugin settings first.');
      return;
    }

    const authHeaders = { Authorization: `Bearer ${token}` };

    let asset: GithubReleaseAsset | undefined;
    try {
      const resp = await requestUrl({
        url: `https://api.github.com/repos/${repo}/releases/tags/nightly`,
        headers: { ...authHeaders, Accept: 'application/vnd.github+json' },
      });
      const release = JSON.parse(resp.text) as GithubRelease;
      asset = release.assets.find((a) => a.name === 'nightly.zip');
      if (!asset) throw new Error('nightly.zip not found on the nightly release');
    } catch (err) {
      new Notice(`Splinter Deployer: could not find nightly release — ${errMessage(err)}`);
      return;
    }

    let zipBuf: ArrayBuffer;
    try {
      new Notice('Splinter Deployer: downloading nightly build…');
      const resp = await requestUrl({
        url: `https://api.github.com/repos/${repo}/releases/assets/${asset.id}`,
        headers: { ...authHeaders, Accept: 'application/octet-stream' },
      });
      zipBuf = resp.arrayBuffer;
    } catch (err) {
      new Notice(`Splinter Deployer: download failed — ${errMessage(err)}`);
      return;
    }

    let entries: Record<string, Uint8Array>;
    try {
      entries = unzipSync(new Uint8Array(zipBuf));
    } catch (err) {
      new Notice(`Splinter Deployer: could not read zip — ${errMessage(err)}`);
      return;
    }

    let config: Record<string, string>;
    try {
      const configEntry = entries['config.json'];
      if (!configEntry) throw new Error('config.json missing from archive');
      config = JSON.parse(strFromU8(configEntry)) as Record<string, string>;
    } catch (err) {
      new Notice(`Splinter Deployer: invalid or missing config.json — ${errMessage(err)}`);
      return;
    }

    let deployed = 0;
    const failures: string[] = [];
    for (const [flatName, vaultRelPath] of Object.entries(config)) {
      const fileData = entries[flatName];
      if (!fileData) {
        failures.push(`${flatName} (not found in archive)`);
        continue;
      }
      try {
        await this.ensureParentFolders(vaultRelPath);
        const buf = fileData.buffer.slice(
          fileData.byteOffset,
          fileData.byteOffset + fileData.byteLength,
        ) as ArrayBuffer;
        await this.app.vault.adapter.writeBinary(vaultRelPath, buf);
        deployed++;
      } catch (err) {
        failures.push(`${vaultRelPath} (${errMessage(err)})`);
      }
    }

    if (deployed > 0) new Notice(`Splinter Deployer: deployed ${deployed} file(s).`);
    if (failures.length > 0) {
      new Notice(`Splinter Deployer: ${failures.length} file(s) failed — see console for details.`);
      console.error('Splinter Deployer failures:', failures);
    }
  }

  private async ensureParentFolders(vaultRelPath: string) {
    const parts = vaultRelPath.split('/').slice(0, -1);
    let cur = '';
    for (const part of parts) {
      cur = cur ? `${cur}/${part}` : part;
      const exists = await this.app.vault.adapter.exists(cur);
      if (!exists) await this.app.vault.adapter.mkdir(cur);
    }
  }
}

class SplinterDeployerSettingTab extends PluginSettingTab {
  plugin: SplinterDeployerPlugin;

  constructor(app: App, plugin: SplinterDeployerPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
      .setName('Source repository')
      .setDesc('owner/repo whose "nightly" release provides nightly.zip')
      .addText((text) =>
        text
          .setPlaceholder('cr4z/vault-codebase')
          .setValue(this.plugin.settings.repo)
          .onChange(async (value) => {
            this.plugin.settings.repo = value.trim();
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName('GitHub personal access token')
      .setDesc('Fine-grained PAT scoped to Contents: Read on the repo above')
      .addText((text) => {
        text.inputEl.type = 'password';
        text
          .setPlaceholder('github_pat_…')
          .setValue(this.plugin.settings.token)
          .onChange(async (value) => {
            this.plugin.settings.token = value.trim();
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName('Deploy now')
      .setDesc('Manually re-run the download + deploy immediately.')
      .addButton((btn) => btn.setButtonText('Deploy now').onClick(() => this.plugin.deploy()));
  }
}
