// index.js
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'


Page({
  data: {
    frames: [],
    avatar: null,
  },
  onLoad: function () {
    // 页面加载时执行的逻辑
    const app = getApp()
    this.setData({
      frames: app.globalData.frames,
      avatar: app.globalData.avatar
    })
  },
  onChooseAvatar(e) {
    const {
      avatarUrl
    } = e.detail
    this.setData({
      avatar: {
        name: "custom",
        src: avatarUrl
      }
    })
    // 更新全局数据
    const app = getApp()
    app.globalData.avatar = this.data.avatar

    this.updateCanvas()
  },
  loadCanvas(id) {
    const query = wx.createSelectorQuery()
    query.select('#myCanvas-' + id).fields({
      node: true,
      size: true
    })
      .exec((res) => {
        const canvas = res[0].node
        const ctx = canvas.getContext('2d')
        // Canvas 画布的实际绘制宽高
        const width = res[0].width
        const height = res[0].height

        // 初始化画布大小
        const dpr = wx.getWindowInfo().pixelRatio
        canvas.width = width * dpr
        canvas.height = height * dpr
        ctx.scale(dpr, dpr)
        // 先清空画布
        ctx.clearRect(0, 0, width, height)
        const avatar = canvas.createImage()
        avatar.onload = () => {
          // 计算缩放比例，保持图片比例居中显示
          const imgW = avatar.width
          const imgH = avatar.height
          let drawW = width,
            drawH = height,
            offsetX = 0,
            offsetY = 0
          if (imgW / imgH > width / height) {
            drawW = width
            drawH = imgH * (width / imgW)
            offsetY = (height - drawH) / 2
          } else {
            drawH = height
            drawW = imgW * (height / imgH)
            offsetX = (width - drawW) / 2
          }
          ctx.drawImage(avatar, offsetX, offsetY, drawW, drawH)

          // 头像绘制完成后再加载并绘制头像框
          const upperLayer = canvas.createImage()
          upperLayer.onload = () => {
            const imgW2 = upperLayer.width
            const imgH2 = upperLayer.height
            let drawW2 = width,
              drawH2 = height,
              offsetX2 = 0,
              offsetY2 = 0
            if (imgW2 / imgH2 > width / height) {
              drawW2 = width
              drawH2 = imgH2 * (width / imgW2)
              offsetY2 = (height - drawH2) / 2
            } else {
              drawH2 = height
              drawW2 = imgW2 * (height / imgH2)
              offsetX2 = (width - drawW2) / 2
            }
            ctx.drawImage(upperLayer, offsetX2, offsetY2, drawW2, drawH2)
          }
          upperLayer.src = this.data.frames[id - 1].src
        }
        avatar.src = this.data.avatar.src
      })
  },
  updateCanvas() {
    // for ... of ... 是es6的语法，可能不被所有小程序版本支持
    var frames = this.data.frames;
    for (var i = 0; i < frames.length; i++) {
      this.loadCanvas(frames[i].id);
    }
  },
  previewFrame: function (e) {
    const frameId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/preview/preview?id=${frameId}`,
    })
  }
})