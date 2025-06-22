// app.js
App({
  onLaunch: function () {
    // 小程序启动时执行的逻辑
    console.log('miniprogram start!')
  },
  globalData: {
    // 全局数据
    frames: [{
      id: 1,
      src: '/images/frame1.png',
      name: '风格一'
    },
    {
      id: 2,
      src: '/images/frame2.png',
      name: '风格二'
    },
    {
      id: 3,
      src: '/images/frame3.png',
      name: '风格三'
    },
    {
      id: 4,
      src: '/images/frame4.png',
      name: '风格四'
    },
    ],
    avatar: {
      name: "default",
      src: "/images/default-avatar.jpg"
    },
  }
})
