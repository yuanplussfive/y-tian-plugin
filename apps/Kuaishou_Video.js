import plugin from '../../../lib/plugins/plugin.js'
import fetch from "node-fetch"
import fs from 'fs'
import puppeteer from '../../../lib/puppeteer/puppeteer.js'
const _path = process.cwd()
let g = []
let time = 0
let name = ""
let feed
let k = []
let m = []
let imgUrl = _path + '/plugins/y-tian-plugin/background/image/bg.jpg'
let num2 = 0
let cookie = "did=web_fb27026de413afaebe6f7e360b1669d5;  ktrace-context=1|MS43NjQ1ODM2OTgyODY2OTgyLjg2ODM5NjI1LjE2ODM0NzQ0NzUzNDMuMzMyMTkw|MS43NjQ1ODM2OTgyODY2OTgyLjY1NjYxNDQzLjE2ODM0NzQ0NzUzNDMuMzMyMTkx|0|graphql-server|webservice|false|NA; userId=2455214856; kuaishou.server.web_st=ChZrdWFpc2hvdS5zZXJ2ZXIud2ViLnN0EqAB4vhVXLoLuKxhy5cmc5RO6GSMRhrG3aGTvkwbIIvB7BFBoQ2IES3psZ8mbcyyX4oXl5dQOGH7zkQ8JbSZeByMpcs2o4WCFS500FCPYuC1NV53NCSf8lzFLsr8FC49RyO53atQb3aEIKYSc8uVWUbWF-DWWD-V78h2aoE9gGq_VNWIV6r8lqD-L9ouvwOM4m1v_xZYTj4vu1KzvBgk5lof-hoS7YoRGiN2PM_7zCD1Dj9m5oYoIiAD6wnaMgFwnh4AFY--a0dDY6q5giaHF6yyIIaQe7eVpigFMAE; kuaishou.server.web_ph=2d168bb863b6628554a6b27231970003b297"

export class example extends plugin {
  constructor() {
    super({
      name: '阴天[快手视频]',
      dsc: '搞笑',
      event: 'message',
      priority: 600,
      rule: [
        {
          reg: "^#(快手|ks)翻页$",
          fnc: 'pages'
        },
        {
          reg: "^#(ks|快手)(.*)$|^#看(快手|ks)视频(.*?)$",
          fnc: 'watch'
        }
      ]
    })
  }


  async pages(e) {
    if ((e.msg.includes("#快手翻页") || e.msg.includes("#ks翻页")) && k.length !== 0 && g.length !== 0) {
      num2 += 1
      g.length = 0
      k.length = 0
      let didv = new Date().getTime()
      let data2 = {
  query: `
    fragment photoContent on PhotoEntity {
      id
      duration
      caption
      originCaption
      likeCount
      viewCount
      commentCount
      realLikeCount
      coverUrl
      photoUrl
      photoH265Url
      manifest
      manifestH265
      videoResource
      coverUrls {
        url
        __typename
      }
      timestamp
      expTag
      animatedCoverUrl
      distance
      videoRatio
      liked
      stereoType
      profileUserTopPhoto
      musicBlocked
      __typename
    }

    fragment feedContent on Feed {
      type
      author {
        id
        name
        headerUrl
        following
        headerUrls {
          url
          __typename
        }
        __typename
      }
      photo {
        ...photoContent
        __typename
      }
      canAddComment
      llsid
      status
      currentPcursor
      tags {
        type
        name
        __typename
      }
      __typename
    }

    query visionSearchPhoto($keyword: String, $pcursor: String, $searchSessionId: String, $page: String, $webPageArea: String) {
      visionSearchPhoto(keyword: $keyword, pcursor: $pcursor, searchSessionId: $searchSessionId, page: $page, webPageArea: $webPageArea) {
        result
        llsid
        webPageArea
        feeds {
          ...feedContent
          __typename
        }
        searchSessionId
        pcursor
        aladdinBanner {
          imgUrl
          link
          __typename
        }
        __typename
      }
    }
  `,
  operationName: "visionSearchPhoto",
  variables: { 
keyword: name, 
pcursor: `${num2}`, 
page: "search" 
},
};
      let a = await fetch("https://www.kuaishou.com/graphql", {
        "method": "POST",
        headers: {
          "content-type": "application/json",
          "cookie": cookie,
          "Referer": "https://www.kuaishou.com/search/video?searchKey=kk",
          "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36 Edg/112.0.1722.46"
        },
        "body": JSON.stringify(data2)
      });
      a = await a.json()
      let length = await a.data.visionSearchPhoto.feeds.length
      feed = await a.data.visionSearchPhoto.feeds
      //console.log(feed)
      //console.log(feed[0])
      for (let i = 1; i <= length; i++) {
        let content = feed[i - 1].photo.caption
        let h = feed[i - 1].photo.coverUrl
        let viewCount = feed[i - 1].photo.viewCount
        let likeCount = feed[i - 1].photo.likeCount
        let cover = feed[i - 1].photo.coverUrl
        let zzname = feed[i - 1].author.name
        g.push({ title: content, url: h })
        k.push({ viewCount: viewCount, likeCount: likeCount, cover: cover, tags: cover, zzname: zzname })
      }
      let op = g
      //console.log(jg)
      for (let i = 0; i < op.length; i++) {
        op[i].title = op[i].title.replace(/<em class="keyword">/g, "").trim()
        op[i].title = op[i].title.replace(/<\/em>/g, "").trim()

      }
      let data = {
        tplFile: './plugins/y-tian-plugin/resources/html/ks.html',
        dz: _path,
        nr2: op,
        imgUrl: imgUrl
      }
      let img = await puppeteer.screenshot("123", {
        ...data,
      });
      e.reply(img)
    }
  }
  async watch(e) {
    if (fs.existsSync("./resources/ks.mp4")) {
      fs.unlinkSync("./resources/ks.mp4");
    }
    if (e.msg.includes("#看ks视频") || e.msg.includes("#看快手视频")) {
      if (name == "") {
        e.reply("你还没有搜索关键词呢")
        return false
      }
    }
    if (e.msg.includes("#ks") || e.msg.includes("#快手")) {
      g.length = 0
      k.length = 0
      name = e.msg.replace(/#ks/g, "")
      .replace(/#快手/g,"")
      .trim()
      let didv = new Date().getTime()
      let data2 = {
  query: `
    fragment photoContent on PhotoEntity {
      id
      duration
      caption
      originCaption
      likeCount
      viewCount
      commentCount
      realLikeCount
      coverUrl
      photoUrl
      photoH265Url
      manifest
      manifestH265
      videoResource
      coverUrls {
        url
        __typename
      }
      timestamp
      expTag
      animatedCoverUrl
      distance
      videoRatio
      liked
      stereoType
      profileUserTopPhoto
      musicBlocked
      __typename
    }

    fragment feedContent on Feed {
      type
      author {
        id
        name
        headerUrl
        following
        headerUrls {
          url
          __typename
        }
        __typename
      }
      photo {
        ...photoContent
        __typename
      }
      canAddComment
      llsid
      status
      currentPcursor
      tags {
        type
        name
        __typename
      }
      __typename
    }

    query visionSearchPhoto($keyword: String, $pcursor: String, $searchSessionId: String, $page: String, $webPageArea: String) {
      visionSearchPhoto(keyword: $keyword, pcursor: $pcursor, searchSessionId: $searchSessionId, page: $page, webPageArea: $webPageArea) {
        result
        llsid
        webPageArea
        feeds {
          ...feedContent
          __typename
        }
        searchSessionId
        pcursor
        aladdinBanner {
          imgUrl
          link
          __typename
        }
        __typename
      }
    }
  `,
  operationName: "visionSearchPhoto",
  variables: { 
keyword: name, 
pcursor: `${num2}`, 
page: "search" 
},
};
      let a = await fetch("https://www.kuaishou.com/graphql", {
        "method": "POST",
        headers: {
          "content-type": "application/json",
          "cookie": cookie,
          "Referer": "https://www.kuaishou.com/search/video?searchKey=kk",
          "Referrer-Policy": "unsafe-url",
          "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36 Edg/112.0.1722.46"
        },
        "body": JSON.stringify(data2)
      });
      a = await a.json()
      //console.log(a)
      let length = await a.data.visionSearchPhoto.feeds.length
      feed = await a.data.visionSearchPhoto.feeds
      //console.log(feed)
      //console.log(feed[0])
      for (let i = 1; i <= length; i++) {
        let content = feed[i - 1].photo.caption
        let h = feed[i - 1].photo.coverUrl
        let viewCount = feed[i - 1].photo.viewCount
        let likeCount = feed[i - 1].photo.likeCount
        let cover = feed[i - 1].photo.coverUrl
        let zzname = feed[i - 1].author.name
        g.push({ title: content, url: h })
        k.push({ viewCount: viewCount, likeCount: likeCount, cover: cover, tags: cover, zzname: zzname })
      }
      let op = g
      //console.log(jg)
      for (let i = 0; i < op.length; i++) {
        op[i].title = op[i].title.replace(/<em class="keyword">/g, "").trim()
        op[i].title = op[i].title.replace(/<\/em>/g, "").trim()

      }
      let data = {
        tplFile: './plugins/y-tian-plugin/resources/html/ks.html',
        dz: _path,
        nr2: op,
        imgUrl: imgUrl
      }
      let img = await puppeteer.screenshot("123", {
        ...data,
      });
      e.reply(img)

    }

    if ((e.msg.includes("#看快手视频") || e.msg.includes("#看ks视频")) && g.length !== 0 && k.length !== 0) {
      let ag = e.msg.replace(/#看快手视频/g, "")
      .replace(/#看ks视频/g,"")
      .trim()
      //console.log(feed[ag-1])
      if (feed[ag - 1].photo.photoH265Url == "") {
        e.reply("当前选定解析失败，看看别的吧")
        k.length = 0
        g.length = 0
        return false
      }
      let video = feed[ag - 1].photo.photoH265Url
      let response = await fetch(video);
      let buff = await response.arrayBuffer()
      fs.writeFileSync("./resources/ks.mp4", Buffer.from(buff), "binary",);
      if (fs.existsSync("./resources/ks.mp4")) {
        fs.stat("./resources/ks.mp4", (err, stats) => {
          if (err) throw err;
          let dx = Math.round(stats.size / 1048576)
          if (dx >= 100) {
            e.reply(`解析文件大小为 ${dx} MB，太大了发不出来，诶嘿,给你无水印地址:${video}`)
            k.length = 0
            g.length = 0
            num2 = 0
            return true
          } else if (dx < 100) {
            let view = k[ag - 1].viewCount
            let like = k[ag - 1].likeCount
            let tag = k[ag - 1].tags
            tag = segment.image(tag)
            //console.log(k)
            let zname = k[ag - 1].zzname
            let bn = ["播放量:", view, "\n点赞数:", like, "\n封面:", tag, "\n作者:", zname]
            e.reply(bn)
            e.reply([segment.video("./resources/ks.mp4")])
            k.length = 0
            g.length = 0
            num2 = 0
            return true
          }
        })
      }
    }
  }
}













