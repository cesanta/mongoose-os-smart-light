var util = {
  generateUniqueID: function() {
    return 'mos_app_' + Math.random().toString(36).substr(2, 9);
  },
  getCookie: function(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    return parts.length === 2 ? parts.pop().split(';').shift() : undefined;
  },
  wsconnect: function() {
    var appID = this.getCookie('app_id');
    if (!appID) {
      appID = this.generateUniqueID();
      document.cookie = 'app_id=' + appID;
    }
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
        } catch (e) {
          console.log('Invalid ws frame:', ev.data);  // eslint-disable-line
        }
        if (msg) wrapper.onmessage(msg);
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
  xhr: function(method, url, data, timeoutMs) {
    return new Promise(function(resolve, reject) {
      const req = new XMLHttpRequest();
      req.open(method, url, true);
      if (timeoutMs) req.timeout = timeoutMs;
      req.onreadystatechange = function() {
        if (req.readyState < 4) return;
        if (req.status === 200 && req.readyState === 4) {
          try {
            resolve(JSON.parse(req.responseText));
          } catch (e) {
            resolve(req.responseText);
          }
        } else if (req.status === 401) {
          reject(req.responseText, req.status);
        } else if (req.readyState === 4) {
          reject(req.responseText, req.status);
        }
      };
      req.onerror = function() {
        reject(req.statusText, req.status);
      };
      var body = data;
      if (data && typeof (data) !== 'string') {
        req.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
        body = JSON.stringify(data);
      }
      req.send(body);
    })
  }
}