// preview.js
Page({
  data: {
    frameSrc: '',
    frameName: '',
    frameId: null,
    avatarSrc: '',
    canvas: null,
  },
  onLoad: function (options) {
    const app = getApp();
    const frames = app.globalData.frames;
    const frameId = options.id;
    this.setData({
      avatarSrc: app.globalData.avatar.src
    });

    const selectedFrame = frames.find(frame => frame.id == frameId);
    if (selectedFrame) {
      this.setData({
        frameSrc: selectedFrame.src,
        frameName: selectedFrame.name,
        frameId: selectedFrame.id
      });
    } else {
      wx.showToast({
        title: '未找到头相框',
        icon: 'error',
        duration: 2000
      });
      // wx.navigateBack({
      //   delta: 1
      // })
    }
    this.drawCanvas()
  },
  drawCanvas() {
    const query = wx.createSelectorQuery()
    query.select('#new-avatar').fields({
        node: true,
        size: true
      })
      .exec((res) => {
        if (!res[0] || !res[0].node) return;
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
          upperLayer.src = this.data.frameSrc
        }
        avatar.src = this.data.avatarSrc

        this.data.canvas = canvas; // 保存 canvas 对象到 data 中
      })
  },
  saveAvatar: function () {
    wx.canvasToTempFilePath({
      canvas: this.data.canvas,
      fail(err) {
        wx.showToast({
          title: '保存失败!',
          icon: 'error',
          duration: 2000
        })
        console.error('canvasToTempFilePath:', err);
      },
      success(res) {
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath, //图片文件路径
          success: function (data) {
            wx.hideLoading(); //隐藏 loading 提示框
            wx.showModal({
              title: '提示',
              content: '保存成功',
              modalType: false,
            })
          },
          fail: function (err) {
            if (err.errMsg === "saveImageToPhotosAlbum:fail:auth denied" || err.errMsg === "saveImageToPhotosAlbum:fail auth deny" || err.errMsg === "saveImageToPhotosAlbum:fail authorize no response") {
              wx.showModal({
                title: '提示',
                content: '需要您授权保存相册',
                modalType: false,
                success: modalSuccess => {
                  wx.openSetting({
                    success(settingdata) {
                      console.log("settingdata", settingdata)
                      if (settingdata.authSetting['scope.writePhotosAlbum']) {
                        wx.showModal({
                          title: '提示',
                          content: '获取权限成功,再次点击图片即可保存',
                          modalType: false,
                        })
                      } else {
                        wx.showModal({
                          title: '提示',
                          content: '获取权限失败，将无法保存到相册哦~',
                          modalType: false,
                        })
                      }
                    },
                    fail(failData) {
                      console.log("failData", failData)
                    },
                    complete(finishData) {
                      console.log("finishData", finishData)
                    }
                  })
                }
              })
            }
          },
          complete(res) {
            wx.hideLoading(); //隐藏 loading 提示框
          }
        })
      }
    })
  },
})