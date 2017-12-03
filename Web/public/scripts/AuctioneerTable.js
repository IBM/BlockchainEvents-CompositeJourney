class AuctioneerTable {
  constructor(user) {
    this.user = user;
    this.id = user + "_view";
    this.eventClass = "org.acme.product.auction.TradeEvent";
  }
  loadData(data) {
    //console.log(data);
    //sort the event data according to timestamp
    data = data.filter(value => value.eventsEmitted.length > 0 && value.eventsEmitted[0].$class === this.eventClass).sort(function(a, b) {
      return new Date(b.eventsEmitted[0]["timestamp"]).getTime() - new Date(a.eventsEmitted[0]["timestamp"]).getTime();
    });
    $('#' + this.id + ' tbody').empty();
    for(var i = 0; i < data.length; i++) {
      var parsed = data[i];
      var eventData = parsed.eventsEmitted[0];
      var rowData = "";
      if(this.user === "seller") {
        rowData = "<tr ><td width='10%'>" + eventData["type"] + "</td><td width='10%'>" + eventData["ownerId"] + "</td><td width='10%'>" + eventData["id"] + "</td><td width='15%'>" + eventData["description"] + "</td><td width='10%'>" + eventData["status"] + "</td><td width='10%'>" + eventData["amount"] + "</td><td width='10%'>" + eventData["buyerId"] + "</td></tr>";
      } else {
        rowData = "<tr ><td width='10%'>" + eventData["type"] + "</td><td width='10%'>" + eventData["ownerId"] + "</td><td width='10%'>" + eventData["id"] + "</td><td width='15%'>" + eventData["description"] + "</td><td width='10%'>" + eventData["status"] + "</td><td width='10%'>" + eventData["amount"] + "</td></tr>";
      }
      $('#' + this.id).append(rowData);
    }
  }
  update(eventData) {
    if(eventData.$class === this.eventClass) {
      var rowData = "";
      if(this.user === "seller") {
        rowData = "<tr class='anim highlight'><td width='10%'>" + eventData["type"] + "</td><td width='10%'>" + eventData["ownerId"] + "</td><td width='10%'>" + eventData["id"] + "</td><td width='15%'>" + eventData["description"] + "</td><td width='10%'>" + eventData["status"] + "</td><td width='10%'>" + eventData["amount"] + "</td><td width='10%'>" + eventData["buyerId"] + "</td></tr>";
      } else {
        rowData = "<tr class='anim highlight'><td width='10%'>" + eventData["type"] + "</td><td width='10%'>" + eventData["ownerId"] + "</td><td width='10%'>" + eventData["id"] + "</td><td width='15%'>" + eventData["description"] + "</td><td width='10%'>" + eventData["status"] + "</td><td width='10%'>" + eventData["amount"] + "</td></tr>";
      }
      $(rowData).hide().prependTo('#' + this.id + ' tbody').fadeIn("slow").addClass('normal');
    }
  }
}