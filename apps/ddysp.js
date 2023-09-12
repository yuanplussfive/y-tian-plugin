import puppeteer from '../../../lib/puppeteer/puppeteer.js'
import fs from "fs"
import plugin from '../../../lib/plugins/plugin.js'
import fetch from 'node-fetch'
import _ from 'lodash'
import common from '../../../lib/common/common.js'

const _path = process.cwd();
let g = []
let k = []
let name
let time = 0

export class example extends plugin {
  constructor() {
    super({
      name: '阴天[抖音]',
      dsc: 'mm',
      event: 'message',
      priority: 0,
      rule: [
        {
          reg: "^#?dy(.*)|^/观看(.*)",
          fnc: 'dy'
        }
      ]
    })
  }
  async dy(e) {
    if (e.msg.includes("/观看")) {
      if (name == "") {
        e.reply("你还没有搜索关键词呢")
        return false
      }
    }
    if (e.msg.includes("dy")) {
      g.length = 0
      k.length = 0
      let title = e.msg.replace(/#?dy/g, "").trim()
      let url = "https://www.douyin.com/aweme/v1/web/general/search/single/?msToken=04AGy_E-9VNO4jIHqR0QtiGrGWXnBq7HNCd8D48uFM4m0UBmP3_LLs-1T_A9G-p-N5EscypW2UGV1rGyUlmwsE-Oz2OoPIKhKcCzG5BjWCs4FKe-8uUn&X-Bogus=DFSzswVLZI0ANCA1tC8V3Oppgiuhdevice_platform=webapp&aid=6383&channel=channel_pc_web&search_channel=aweme_general&sort_type=0&publish_time=0&keyword=" + `${title}` + "&search_source=normal_search&query_correct_type=1&is_filter_search=0&from_group_id=&offset=0&count=15&pc_client_type=1&version_code=190600&version_name=19.6.0&cookie_enabled=true&screen_width=1536&screen_height=1864&browser_language=zh-CN&browser_platform=Win32&browser_name=Edge&browser_version=112.0.1722.64&browser_online=true&engine_name=Blink&engine_version=112.0.0.0&os_name=Windows&os_version=10&cpu_core_num=8&device_memory=8&platform=PC&downlink=1.55&effective_type=3g&round_trip_time=600&webid=7230522786644624955"
      let a = await fetch(url, {
        "headers": {
          "cookie": "ttwid=1%7Cv6uiMMlTyemDFKmbsx0oKYRvv5vRyZN2NUaAUxcGsMw%7C1683487286%7C5810129a0f99da318b745a80df31f11629127c8c48a0f61c56a510e7ff3b0fcd; n_mh=Ne9S9LLywAm58bsPdnjqz6P_yHeulG7xxNy9ZjECdOE; LOGIN_STATUS=1; store-region=us; store-region-src=uid; __ac_nonce=064bacacb004cc9bba99a; __ac_signature=_02B4Z6wo00f013RHUmgAAIDCgTi49h-0Zo90Z1bAALm2IpSWA5gqYw2wO0Apu5NrnGPO8m0wKojmvioMTZfWdxlwpdMVLCbAcm1SfuyN1F2o9HbHGPXzYsPMK5NmJnEWBCEoe4CgK9aYwnLG61; douyin.com; device_web_cpu_core=8; device_web_memory_size=8; webcast_local_quality=null; strategyABtestKey=%221689963213.948%22; passport_csrf_token=ad9dec92f7b54a9ccefe6e79a71af971; passport_csrf_token_default=ad9dec92f7b54a9ccefe6e79a71af971; s_v_web_id=verify_lkcwgpl8_SlLOFy9G_hiBG_42R6_BoI1_czON4M2cedOF; __bd_ticket_guard_local_probe=1689963214302; bd_ticket_guard_client_data=eyJiZC10aWNrZXQtZ3VhcmQtdmVyc2lvbiI6MiwiYmQtdGlja2V0LWd1YXJkLWl0ZXJhdGlvbi12ZXJzaW9uIjoxLCJiZC10aWNrZXQtZ3VhcmQtY2xpZW50LWNzciI6Ii0tLS0tQkVHSU4gQ0VSVElGSUNBVEUgUkVRVUVTVC0tLS0tXHJcbk1JSUJEakNCdFFJQkFEQW5NUXN3Q1FZRFZRUUdFd0pEVGpFWU1CWUdBMVVFQXd3UFltUmZkR2xqYTJWMFgyZDFcclxuWVhKa01Ga3dFd1lIS29aSXpqMENBUVlJS29aSXpqMERBUWNEUWdBRTJGblo1L3AzcUhEMWFNV1czb0N6K21LbVxyXG5lbmRsK0E4dFR0L1duS0lpSkQwdVM3c0I2YzhVTnJGVldOK1BnOFoxV3FlV0RrYjFWTXhVc0ZpLzJnRS9aNkFzXHJcbk1Db0dDU3FHU0liM0RRRUpEakVkTUJzd0dRWURWUjBSQkJJd0VJSU9kM2QzTG1SdmRYbHBiaTVqYjIwd0NnWUlcclxuS29aSXpqMEVBd0lEU0FBd1JRSWdIQWFYbkdtUElhelE4ekZ1QkFtbC9oYUg1Rzk0eW4zQWJCRndEV0VYL3JFQ1xyXG5JUUNtRldPMjJ1QVgwTVk1N2hxOXZRbmUxNEJSdDZpV0V5Y0tET1hJZlJmRVRRPT1cclxuLS0tLS1FTkQgQ0VSVElGSUNBVEUgUkVRVUVTVC0tLS0tXHJcbiJ9; volume_info=%7B%22isUserMute%22%3Afalse%2C%22isMute%22%3Atrue%2C%22volume%22%3A0.5%7D; FORCE_LOGIN=%7B%22videoConsumedRemainSeconds%22%3A180%2C%22isForcePopClose%22%3A1%7D; download_guide=%221%2F20230722%2F0%22; sso_uid_tt=a4cdc0e7f5ea2a9081d18116ab008067; sso_uid_tt_ss=a4cdc0e7f5ea2a9081d18116ab008067; toutiao_sso_user=6da85b47143f4e0a95894ee9710941ce; toutiao_sso_user_ss=6da85b47143f4e0a95894ee9710941ce; passport_auth_status=4dea58aca10f945a5a7f934ea2898359%2C; passport_auth_status_ss=4dea58aca10f945a5a7f934ea2898359%2C; uid_tt=d04b539cf93c546b6edeb544f8ce9a18; uid_tt_ss=d04b539cf93c546b6edeb544f8ce9a18; sid_tt=66dbc8a208c21561fd8e17dc784b4d0b; sessionid=66dbc8a208c21561fd8e17dc784b4d0b; sessionid_ss=66dbc8a208c21561fd8e17dc784b4d0b; odin_tt=05fb6ea02b90cd9fe7b2322190c6fd144301409a1f5e83906008244317f99573cc11a1114e9b3b3928e444719a8e92caf236bbf3fdabb5cc2ec57dfe0c64ff6d; passport_assist_user=CkFg6SGAuh8p-b9bZqoZIk7jqxUGg946raU_Yw6CG6f7PREckmSDi8NYE-Xhl9sIMFVUM2EAuZR822p3oU7NBNK7ahpICjwTU5CWHtOgjk1rPvwP7dLK0ZvVIuzHKn5FpGu_0s7m-Voihlcxh4EMNCjdyGx7D86UHtZjM-XFs_Rhn0oQ7o23DRiJr9ZUIgEDF5RGZA%3D%3D; sid_ucp_sso_v1=1.0.0-KGEyNTZjZWQ4NjU0MmJjNzk2NjMyYzQ2NDY4MDFkMzM0ZjU3ZTYwNTgKHwjtgqHwyozuARDmluulBhjvMSAMMLjDq4oGOAZA9AcaAmhsIiA2ZGE4NWI0NzE0M2Y0ZTBhOTU4OTRlZTk3MTA5NDFjZQ; ssid_ucp_sso_v1=1.0.0-KGEyNTZjZWQ4NjU0MmJjNzk2NjMyYzQ2NDY4MDFkMzM0ZjU3ZTYwNTgKHwjtgqHwyozuARDmluulBhjvMSAMMLjDq4oGOAZA9AcaAmhsIiA2ZGE4NWI0NzE0M2Y0ZTBhOTU4OTRlZTk3MTA5NDFjZQ; publish_badge_show_info=%220%2C0%2C0%2C1689963367272%22; VIDEO_FILTER_MEMO_SELECT=%7B%22expireTime%22%3A1690568167916%2C%22type%22%3Anull%7D; home_can_add_dy_2_desktop=%221%22; csrf_session_id=854bfcd8c7475421efa8dab65d1fc702; sid_guard=66dbc8a208c21561fd8e17dc784b4d0b%7C1689963368%7C5183998%7CTue%2C+19-Sep-2023+18%3A16%3A06+GMT; sid_ucp_v1=1.0.0-KGVlMzYzNmZkZGRkOGRhZWYxYzZhZDdjMGVmZWIwZTg0YzgxMzBiNTMKGwjtgqHwyozuARDoluulBhjvMSAMOAZA9AdIBBoCaGwiIDY2ZGJjOGEyMDhjMjE1NjFmZDhlMTdkYzc4NGI0ZDBi; ssid_ucp_v1=1.0.0-KGVlMzYzNmZkZGRkOGRhZWYxYzZhZDdjMGVmZWIwZTg0YzgxMzBiNTMKGwjtgqHwyozuARDoluulBhjvMSAMOAZA9AdIBBoCaGwiIDY2ZGJjOGEyMDhjMjE1NjFmZDhlMTdkYzc4NGI0ZDBi; _bd_ticket_crypt_cookie=b29abf7ece391e6975f139e50dae9edb; __security_server_data_status=1; msToken=JkTNDB6ZhM-XSm2-MRcUYAP9rBXGLMkmCIN4hFJr1QPRHgBURob-fX2OpKlY5Ll4kPfkIXqcbDcua43mO4i-zBBA5LtWPiEfnrWjlIrCOca6VBwWmtQbdQ==; msToken=VVDkT0JwNUu1qQ6I8e5Cm8PGA0yF7Gtf_mZbU5xzjx7x26OMK0I3-cogG_tsYcMTWuVdLINrCQXhjbjG_uwdttvfDWg-IsLwyPLZnUvSmY-h9Fo7x7kz9w==; tt_scid=E7VpmplvaGlxheH.YhFAAnF328XN4NxfkWD78ScLApaPlgw5aloVI7suM9QKOJGdba31; d_ticket=a2f4db1ddcfa3671ac2dd0832a11883f11e0c; pwa2=%221%7C0%7C2%7C0%22; passport_fe_beating_status=false; _wafchallengeid=eyJ2Ijp7ImEiOiJwZGQ4c2YvSndmVzNMRTFRZklnWVVIaWEyU0dyS1hXWmZ5enI4cFVSSlhrPSIsImIiOjE2ODk5NjM0NTAsImMiOiJtbjk2eFV3d1BoeXZHVEdod2d0bmpPa2FUVCs5YkhEM0pSL2lJVkExWEE0PSJ9LCJzIjoidGJMaE5sM292S0doeDJRMGZySnJ4Tmp5Nk40TnVQQmpUcVV6ckdwS2k5ND0iLCJkIjoiTnpjeCJ9",
          "Referer": "https://www.douyin.com/search/%E6%B3%A1%E6%B2%AB?aid=9ed9a295-60d1-406a-9cf5-18ddcd2382c7&publish_time=0&sort_type=0&source=normal_search&type=general",
          "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36 Edg/112.0.1722.64"
        }
      });
      a = await a.json()
      //console.log(a.data)
      let length = a.data.length
      for (let l = 1; l < length; l++) {
        //console.log(typeof(a.data[l].aweme_info))
        if (typeof (a.data[l].aweme_info) === "object") {
          let data = await a.data[l].aweme_info.aweme_id
          let desc = await a.data[l].aweme_info.desc
          if (typeof (a.data[l].aweme_info.video.cover) !== "undefined") {
            let uri = await a.data[l].aweme_info.video.cover.url_list[0]
            k.push({ title: desc, uri: uri })
          }
          g.push(data)
        }
      }
      //console.log(k)

      let op = k
      for (let i = 0; i < op.length; i++) {
        op[i].title = op[i].title.replace(/<em class="keyword">/g, "").trim()
        op[i].title = op[i].title.replace(/<\/em>/g, "").trim()

      }
      let data = {
        tplFile: './plugins/y-tian-plugin/resources/html/dy.html',
        dz: _path,
        nr2: op,

      }
      let img = await puppeteer.screenshot("777", {
        ...data,
      });
      e.reply(img)
    }
    if (e.msg.includes("/观看") && g.length !== 0 && k.length !== 0) {
      let ag = e.msg.replace("/观看", "").trim()
      let ghb = "https://www.douyin.com/video/" + g[ag - 1]
      console.log(ghb)
      let gh = await fetch(ghb, {
        method: "GET",
        headers: {
          'cookie': 'douyin.com; __ac_referer=https://www.douyin.com/video/7200695840900468008?previous_page=app_code_link; ttwid=1|j0PqIlrsmT-PHeVL26MUtN9yWhDtKz30FgIuxpGtk80|1674043522|ae7ca62b2f5b11ae675d1dbaa91768445c433af4faf7c61f1f7c5f52eece4bf9; passport_csrf_token=aaa188ac0b7b481a1380949b67d3d703; passport_csrf_token_default=aaa188ac0b7b481a1380949b67d3d703; s_v_web_id=verify_lfl7886x_rxeSUCen_4cnm_48bF_9NrH_hxQbP70AdImW; download_guide="3/20230324"; _tea_utm_cache_2018=undefined; douyin.com; VIDEO_FILTER_MEMO_SELECT={"expireTime":1680431163129,"type":1}; strategyABtestKey="1679854423.401"; SEARCH_RESULT_LIST_TYPE="single"; bd_ticket_guard_client_data=eyJiZC10aWNrZXQtZ3VhcmQtdmVyc2lvbiI6MiwiYmQtdGlja2V0LWd1YXJkLWNsaWVudC1jc3IiOiItLS0tLUJFR0lOIENFUlRJRklDQVRFIFJFUVVFU1QtLS0tLVxyXG5NSUlCRFRDQnRRSUJBREFuTVFzd0NRWURWUVFHRXdKRFRqRVlNQllHQTFVRUF3d1BZbVJmZEdsamEyVjBYMmQxXHJcbllYSmtNRmt3RXdZSEtvWkl6ajBDQVFZSUtvWkl6ajBEQVFjRFFnQUV1ZVZvbHhpVERqR25HYzVWK2NSTnRmS2JcclxuNzZvRTFIczlCTmhFeGQ0QmVPR1Q1RWlQQzlEdWFGUm1ma2FTMENEcW5KUlpHa1pLcEsydklKV0Nwek1naHFBc1xyXG5NQ29HQ1NxR1NJYjNEUUVKRGpFZE1Cc3dHUVlEVlIwUkJCSXdFSUlPZDNkM0xtUnZkWGxwYmk1amIyMHdDZ1lJXHJcbktvWkl6ajBFQXdJRFJ3QXdSQUlnZitHRUdXeElNVFluV2dXMFh1VmxVUG1WZnVPcXRIQkJRZS93cFcyN1B3VUNcclxuSUFnRGE2ZmFKQUQxOXhjelBXaVNoMFk4d3Q0MXpNYVdhWVpNLytWRm05VWxcclxuLS0tLS1FTkQgQ0VSVElGSUNBVEUgUkVRVUVTVC0tLS0tXHJcbiJ9; home_can_add_dy_2_desktop="1"; tt_scid=qvEA8Gi93gEWYCi7W.93G0Ol7J-0IHK3Jxth6ueDiJFEyzUYR1NJ2QE-raZzeKOB10ea; msToken=Glj54AQpSCmhHYCkgIt17ZW7MMpZJFGU8xqlVAZ-kgMKKdGFtDQj1BCkfATvT0oUZGpMCXvevAQ0__0WbYO61zVGcyDVfLQAEDQS3qgr0D9Ra88XvBOgUqF0C1OZMAQ=; __ac_nonce=06420a6c9000781ffd1c5; __ac_signature=_02B4Z6wo00f01NwaGsgAAIDBKWXwVnVeJKjcKh5AAFMrbprNm0cHIYv-FNwvshbfXRPVsd6gDwAPXgX-KbFn4PJGV8edUNszVZjUiF15OfNwVcLvBrVSSMxd4ZVRj4ho8n3lTbugUwFptnl98c; __ac_referer=__ac_blank; msToken=cF1l5QZStCUviBVUb2ZJLvblsw3e4qnbOFy0WscazP6ZJ3FXyDgTYoI8sQIgT3dnYGjRoXsTvABkJhDpzf6JRwR6Uby7_nBp1wq6r1XN6VuntHZN1b1QGG6IMCub_VE=',
          "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36 Edg/111.0.1661.51"
        }
      })
      gh = await gh.text()
      let vd = gh.match(/src%22%3A%22%2F%2Fv26(.*?)%22%7D%2C%7B%22/g)
      vd = `${vd}`
      let gg = vd.split(",")
      let hh = decodeURIComponent(gg[1])
      hh = hh.replace('src":"', "https:").replace('"},{"', "")
      if (hh == "undefined") {
        e.reply("解析失败了.....换个观看吧！")
        k.length = 0
        g.length = 0
        return false
      }
      console.log("解析成功,地址为:" + hh)
      let response = await fetch(hh);
      let buff = await response.arrayBuffer();
      var filename = "./resources/dy.mp4";
      fs.writeFileSync(`${filename}`, Buffer.from(buff), "binary",);
      if (fs.existsSync(filename)) {
        fs.stat(`${filename}`, (err, stats) => {
          if (err) throw err;
          let dx = Math.round(stats.size / 1048576)
          if (dx >= 100) {
            e.reply(`解析文件大小为 ${dx} MB，太大了发不出来，诶嘿,给你无水印地址:${hh}`)
            g.length = 0
            k.length = 0
            return false
          } else {
            e.reply([segment.video(filename)])
            g.length = 0
            k.length = 0
          }
        });
      }
    }
  }
}