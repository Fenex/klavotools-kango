/**
 * A kango framework mock object
 *
 * @author Daniil Filippov aka agile <filippovdaniil@gmail.com>
 */

module.exports = {
  getExtensionInfo: function () {},
  addMessageListener: function (name, callback) {},
  removeMessageListener: function (name, callback) {},
  dispatchMessage: function (name, data) {},
  invokeAsync: function () {},
  invokeAsyncCallback: function () {},

  console: {
    log: function (message) {},
  },
  storage: {
    getItem: function (name) {},
    setItem: function (name, value) {},
    removeItem: function (name) {},
    getKeys: function () {},
    clear: function () {},
  },
  xhr: {
    getXMLHttpRequest: function () {},
    send: function (details, callback) {},
  },
  browser: {
    addEventListener: function (name, callback) {},
    removeEventListener: function (name, callback) {},
    getName: function () {},

    tabs: {
      getAll: function (callback) {},
      getCurrent: function (callback) {},
      create: function (details) {},
    },
    windows: {
      getAll: function (callback) {},
      getCurrent: function (callback) {},
      create: function (details) {},
    },
  },
  ui: {
    browserButton: {
      addEventListener: function (name, callback) {},
      removeEventListener: function (name, callback) {},
      setTooltipText: function (text) {},
      setIcon: function (path) {},
      setBadgeValue: function (value) {},
      setBadgeBackgroundColor: function (color) {},
      setPopup: function (details) {},
    },
    optionsPage: {
      open: function (hash) {},
    },
    notifications: {
      show: function (title, text, icon, onClick) {},
    },
  },
  i18n: {
    getMessage: function (name) {},
    getMessages: function () {},
  },
  io: {
    getResourceUrl: function (filename) {},
  },
};
