export default class base {
  constructor(e = {}) {
    this.e = e;
    this.user_id = e?.user_id;
    this.model = "y-t-help";
    this._path = process.cwd().replace(/\\/g, "/");
  }

  get prefix() {
    return `Yz:y-t-plugin:${this.model}:`;
  }

  /**
   * 截图默认数据
   * @param saveId html保存id
   * @param tplFile 模板html路径
   * @param pluResPath 插件资源路径
   */
  get screenData() {
    return {
      saveId: this.user_id,
      tplFile: `./plugins/y-tian-plugin/resources/html/${this.model}.html`,
      /** 绝对路径 */
      pluResPath: `${this._path}/plugins/y-tian-plugin/resources/`,
    };
  }
}
