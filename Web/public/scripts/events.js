class Events {
  constructor() {
    if(location.pathname.endsWith("seller.html")) {
      this.table = new AuctioneerTable("seller");
    } else if(location.pathname.endsWith("buyer.html")) {
      this.table = new AuctioneerTable("buyer");
    }
    // Listen for events
    this.socket = new WebSocket(Events.URL_TRADE);
    this.socket.addEventListener('open', evt => this.doSocketOpen(evt));
    this.socket.addEventListener('close', evt => this.doSocketClose(evt));
    this.socket.addEventListener('message', evt => this.doSocketMessage(evt));
    // Load initial data
    this.xhr = new XMLHttpRequest();
    this.xhr.addEventListener('load', evt => this.doInitialLoad(evt));
    this.xhr.open('GET', Events.URL_HIST, true);
    this.xhr.send(null);
  }
  // Initial data loaded
  // Populate table and chart
  doInitialLoad(evt) {
    var data = JSON.parse(this.xhr.responseText);
    //alert(data);
    this.table.loadData(data);
    console.log('Loaded ' + data.length + ' records.');
  }
  // FYI
  doSocketClose(evt) {
    console.log('Close.');
  }
  // Transaction has taken place
  // Update table and chart
  doSocketMessage(evt) {
    let data = JSON.parse(evt.data);
    this.table.update(data);
  }
  // FYI
  doSocketOpen(evt) {
    console.log('Open.');
  }
}
Events.URL_HIST = 'http://localhost:3000/api/system/historian';
Events.URL_TRADE = 'ws://localhost:3000';
let app = new Events();