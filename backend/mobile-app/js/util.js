var util = {
  generateUniqueID: function() {
    return 'mos_app_' + Math.random().toString(36).substr(2, 9);
  },
  getCookie: function(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    return parts.length === 2 ? parts.pop().split(';').shift() : undefined;
  },
  wsconnect: function(appID) {
    var l = window.location;
    var proto = l.protocol === 'https:' ? 'wss:' : 'ws:';
    var url = `${proto}//${l.host}${l.pathname}ws`;
    var wrapper = {
      shouldReconnect: true,
      close: () => {
        wrapper.shouldReconnect = false;
        wrapper.ws.close();
      },
    };
    var reconnect = () => {
      console.log('Reconnecting to', url);
      var ws = new WebSocket(url), msg;
      ws.onmessage = (ev) => {
        try {
          msg = JSON.parse(ev.data);
          wrapper.onmessage(msg);
        } catch (e) {
          console.log('Invalid ws frame:', ev.data);  // eslint-disable-line
        }
      };
      ws.onclose = () => {
        window.clearTimeout(wrapper.tid);
        if (wrapper.shouldReconnect) {
          wrapper.tid = window.setTimeout(reconnect, 1000);
        }
      };
      wrapper.ws = ws;
    };
    reconnect();
    return wrapper;
  },
};
