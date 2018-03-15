import { toParams, toQuery } from "./utils";

class PopupWindow {
  constructor(state, url, options = {}) {
    this.state = state;
    this.url = url;
    this.options = options;
  }

  open() {
    const { url, id, options } = this;

    this.window = window.open(url, id, toQuery(options, ','));
  }

  cancel() {
    if (this._iid) {
      window.clearInterval(this._iid);
      this._iid = null;
    }
  }

  close() {
    this.cancel();
    this.window.close();
  }

  poll() {
    this.promise = new Promise((resolve, reject) => {
      this._iid = window.setInterval(() => {
        try {
          const popup = this.window;

          if (!popup || popup.closed) {
            this.close();

            return reject(new Error('The popup was closed'));
          }

          if (popup.location.href === this.url || popup.location.pathname === 'blank') {
            return;
          }

          const params = toParams(popup.location.search.replace(/^\?/, ''));
          if (params.state !== this.state) {
            reject(new Error('Incorrect state: unknown source!'));
          } else {
            resolve(params);
          }

          this.close();
        } catch (e) {
          // Ignore DOMException
        }
      }, 500);
    })
  }

  then(...args) {
    return this.promise.then(...args);
  }

  catch(...args) {
    return this.promise.then(...args);
  }

  static open(...args) {
    const popup = new this(...args);

    popup.open();
    popup.poll();

    return popup;
  }
}

export default PopupWindow;
