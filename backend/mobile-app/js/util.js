var util = {
  generateUniqueID: function() {
    return 'mos_app_' + Math.random().toString(36).substr(2, 9);
  },
  getCookie: function(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    return parts.length === 2 ? parts.pop().split(';').shift() : undefined;
  },
  wsconnect: function(url) {
    if (!url) {
      var proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
      url = `${proto}//${location.host}/ws`;
    }
    var wrapper = {
      closed: false,
      close: () => {
        wrapper.closed = true;
        wrapper.ws.close();
      },
    };
    var reconnect = () => {
      console.log('Reconnecting to', url);
      var ws = new WebSocket(url);
      ws.onmessage = (ev) => {
        var msg;
        try {
          msg = JSON.parse(ev.data);
        } catch (e) {
          console.log('Invalid ws frame:', ev.data);  // eslint-disable-line
        }
        if (msg) wrapper.onmessage(msg);  // Callback outside of try block
      };
      ws.onclose = () => {
        clearTimeout(wrapper.tid);
        if (!wrapper.closed) wrapper.tid = setTimeout(reconnect, 1000);
      };
      wrapper.ws = ws;
    };
    reconnect();
    return wrapper;
  },
};
