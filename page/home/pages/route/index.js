const { queryLine, details, postHotRoute } = require("~/common/api/bus")
const { defaultRouteDetail } = require("~/common/data")
const _ = require('~/common/lodash-min')
const { LINE_HISTORY } = require('~/common/constant')
let interval = 0
// page/home/pages/route/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: '',
    routeDetail: defaultRouteDetail,
    upOrDown: 'down',
    groupsVl: {},
    historyList: [],
    isCollected: false
  },
  handleCollect() {
    const { routeDetail, upOrDown, id, historyList, isCollected } = this.data
    const lineItem = {
      endStation: routeDetail[upOrDown].endStation,
      lineName: id,
      startStation: routeDetail[upOrDown].startStation,
      upOrDown: upOrDown
    }
    const idx = historyList.findIndex((m) => m.lineName === lineItem.lineName)
    if (idx >= 0) {
      historyList.splice(idx, 1)
    }
    if (!isCollected) {
      historyList.push(lineItem)
    }
    const newIsCollected = historyList.findIndex((m) => m.lineName === this.data.id) >= 0
    wx.setStorage({
      key: LINE_HISTORY,
      data: historyList
    })
    this.setData({
      isCollected: newIsCollected,
      historyList
    })
  },
  intervalDetail() {
    clearInterval(interval)
    interval = setInterval(() => {
      this.fetchDetails()
    }, 30000)
  },
  handleSwap() {
    this.setData({
      upOrDown: this.data.upOrDown === 'down' ? 'up' : 'down'
    })
    this.fetchDetails()
  },
  async fetchDetails() {
    const { data } = await details(this.data.routeDetail[this.data.upOrDown].id)
    const vehicleDetail = data
    this.setData({
      crtBusOrderId: vehicleDetail.list.map((m) => m.vehicleOrder)
    })
    const vL = vehicleDetail.list
    const groups = vL.length ? _.groupBy(vL, 'vehicleOrder') : {}
    this.setData({
      groupsVl: groups
    })
  },
  async fetchLine() {
    postHotRoute(this.data.id)
    const { data } = await queryLine(this.data.id)
    this.setData({
      routeDetail: data
    })
    if (this.data.routeDetail.down) {
      this.setData({
        upOrDown: 'down'
      })
    }
    else {
      this.setData({
        upOrDown: 'up'
      })
    }
    this.fetchDetails()
    this.intervalDetail()
  },//'22%25E8%25B7%25AF'
  // '22%E8%B7%AF'
  fetchData() {
    this.fetchLine()
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({
      id: decodeURIComponent(options.id),
      upOrDown: decodeURIComponent(options.upOrDown)
    })
    this.fetchData()
    wx.getStorage({
      'key': LINE_HISTORY,
      success: (res) => {
        const isCollected = res.data.findIndex((m) => m.lineName === this.data.id) >= 0
        this.setData({
          historyList: res.data,
          isCollected
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.intervalDetail()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {
    clearInterval(interval)
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    clearInterval(interval)
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})
