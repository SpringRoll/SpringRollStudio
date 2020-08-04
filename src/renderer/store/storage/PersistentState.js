import Store from 'electron-store';
import merge from 'deepmerge';
import { ipcMain, ipcRenderer } from 'electron';

/**
 * Referenced from vuex-electron to allow for full configuration of electron-store.
 * @class PersistentState
 */
class PersistentState {
  /**
   *
   * @readonly
   * @memberof PersistentState
   */
  get state() { return this.storage.get(this.key); }
  /**
   *
   * @memberof PersistentState
   */
  set state(value) { this.storage.set(this.key, value); }

  /**
   * Creates an instance of PersistentState.
   * @param {*} options
   * @param {*} vuexStore
   * @memberof PersistentState
   */
  constructor(options, vuexStore) {
    this.key = options.key || 'state';

    this.events = {
      IPC_CONNECT: 'ipcBridgeConnect',
      IPC_NOTIFY_MAIN: 'ipcNotifyMain',
      IPC_NOTIFY_RENDERER: 'ipcNotifyRenderer'
    };
    this.connections = {};

    this.storage = new Store(options);
    this.vuexStore = vuexStore;

    if (this.state) {
      this.vuexStore.replaceState(merge(this.vuexStore.state, this.state));
    }
    this.state = this.vuexStore.state;

    this.vuexStore.subscribe((mutation, state) => this.state = state);

    // Setup main and renderer process bridging.
    // This will sync up the main and renderer processes' store objects.
    if (process.type === 'renderer') {
      this.setupRendererProcessBridge();
    }
    else {
      this.setupMainProcessBridge();
    }
  }

  /**
   *
   * @memberof PersistentState
   */
  setupMainProcessBridge() {
    // Listen for bridge connections.
    ipcMain.on(this.events.IPC_CONNECT, (event) => {
      const sender = event.sender;
      const senderId = sender.id;

      this.connections[senderId] = sender;

      // Manage connection.
      sender.on('destroyed', () => delete this.connections[senderId]);
    });

    // Listen for bridge notifications to the main procress.
    ipcMain.on(this.events.IPC_NOTIFY_MAIN, (event, { type, payload }) => this.vuexStore.dispatch(type, payload));

    // Anytime there is an update to the main process's store, notify the renderer process of that change.
    this.vuexStore.subscribe((mutation) => {
      const { type, payload } = mutation;

      // Update each connection.
      Object.keys(this.connections).forEach(id => {
        this.connections[id].send(this.events.IPC_NOTIFY_RENDERER, { type, payload });
      });
    });
  }

  /**
   *
   * @memberof PersistentState
   */
  setupRendererProcessBridge() {
    ipcRenderer.send(this.events.IPC_CONNECT);

    // Cahce the original vuex commit.
    const vuexCommit = this.vuexStore.commit;

    // Warn about using commit in the renderer process. Main might update update correctly.
    // NOTE: This should throw an error, however for testing we need to be able to change the
    //       state directly from the renderer process.
    this.vuexStore.commit = (type, payload) => { 
      console.warn('You should not call commit in the renderer process. Use dispatch instead.');
      vuexCommit(type, payload);
    };
    // Forward renderer process dispatches to the main process.
    this.vuexStore.dispatch = (type, payload) => ipcRenderer.send(this.events.IPC_NOTIFY_MAIN, { type, payload });

    // Listen for store changes from the main process and apply them.
    ipcRenderer.on(this.events.IPC_NOTIFY_RENDERER, (event, { type, payload }) => {
      vuexCommit(type, payload);
    });
  }
}

export default (options = {}) => vuexStore => new PersistentState(options, vuexStore);