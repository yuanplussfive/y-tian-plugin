import { update } from "../../other/update.js"
export class update extends plugin {
  constructor() {
    super({
      name: "阴天更新",
      event: "message",
      priority: 1000,
      rule: [
        {
          reg: "^#*阴天(插件)?(强制)?更新$",
          fnc: "update"
        }
      ]
    })
  }
  
  async update(e = this.e) {
    e.msg = `#${e.msg.includes("强制")?"强制":""}更新y-tian-plugin`
    const updates = new update(e)
    updates.e = e
    return updates.update()
  }
}