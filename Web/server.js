/**
 * Copyright 2017 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License'); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */
'use strict';
const express = require('express'); // app server
const bodyParser = require('body-parser'); // parser for post requests
//require('metrics-tracker-client').track();
const server = express();
const COMPOSER_URL = "http://localhost:3000/api/";
const request = require('request');
// Bootstrap application settings
server.use(express.static('./public')); // load UI from public folder
server.use(bodyParser.json());
const port = process.env.PORT || 8000;
var seller = [];
var member = [];
var productid = [];
var listingId = [];
const namespace = "org.acme.product.auction.";
server.get('/load', function(req, res) {
  populate();
  res.json({
    "result": 'Success'
  });
})

function populate() {
  var sellerData = generateUserData("Seller", generateString(), "post");
  seller.push(sellerData.email);
  composerCall(COMPOSER_URL + "Seller", sellerData, "post").then(data => {
    console.log("sleep start0");
    sleep(5000);
    console.log("sleep end");
    return composerCall(COMPOSER_URL + "AddProduct", generateProductData(seller[0]), "post");
  }).then(data => {
    console.log("sleep start1");
    sleep(5000);
    console.log("sleep end");
    return composerCall(COMPOSER_URL + "AddProduct", generateProductData(seller[0]), "post");
  }).then(data => {
    var url = COMPOSER_URL + "Seller/" + seller[0];
    return composerCall(url, "", "get");
  }).then(data => {
    console.log("sleep start2");
    sleep(5000);
    console.log("sleep end");
    data = JSON.parse(data);
    //console.log("In Seller Add");
    for(var i = 0; i < data.products.length; i++) {
      //  console.log(data.products[i].productId);
      productid.push(data.products[i].productId);
      console.log("sleep start12");
      sleep(15000);
      console.log("sleep end");
      composerCall(COMPOSER_URL + "StartBidding", {
        "$class": "org.acme.product.auction.StartBidding",
        "reservePrice": 100,
        "product": "resource:org.acme.product.auction.Product#" + data.products[i].productId
      }, "post");
    }
    return true;
  }).then(function() {
    var memeberData = generateUserData("Member", generateString());
    member.push(memeberData.email);
    return composerCall(COMPOSER_URL + "Member", memeberData);
  }).then(data => {
    //console.log(data);
    var memeberData = generateUserData("Member", generateString());
    member.push(memeberData.email);
    return composerCall(COMPOSER_URL + "Member", memeberData);
  }).then(data => {
    return composerCall(COMPOSER_URL + "ProductListing", "", "get");
  }).then(data => {
    console.log("Product listing data ");
    data = JSON.parse(data);
    console.log(data);
    for(var i = 0; i < data.length; i++) {
      console.log(data[i].state);
      console.log(data[i].listingId);
      if(data[i].state === "FOR_SALE") {
        console.log(data[i].listingId);
        listingId.push(data[i].listingId);
      }
    }
    /*
    var bid = function(listingIndex, memberIndex) {
      console.log("In bid");
      return new Promise((resolve, reject) => {
        if(listingIndex < listingId.length) {
          if(memberIndex < member.length) {
            return composerCall(COMPOSER_URL + "Offer", generateBidData(this.listingId[listingIndex], member[memberId]), "post").then(data => {
              resolve(bid(listingIndex, memberIndex + 1));
            });
          } else {
            resolve(bid(listingIndex + 1, 0));
          }
        } else {
          resolve(true);
        }
      })
    };*/
    //var bid = function(listingIndex, memberIndex) {
    // logic here
    //};
    //  return bid(0, 0);
  }).then(function() {}).catch(error => console.log(error));
}

function generateBidData(listingId, memberId) {
  return {
    "$class": "org.acme.product.auction.Offer",
    "bidPrice": generateNumber(),
    "listing": "resource:org.acme.product.auction.ProductListing#" + listingId,
    "member": "resource:org.acme.product.auction.Member#" + memberId
  };
}

function generateProductData(seller) {
  return {
    "$class": "org.acme.product.auction.AddProduct",
    "description": generateString(),
    "owner": "resource:org.acme.product.auction.Seller#" + seller
  };
}

function generateUserData(type, id) {
  var data = {
    $class: namespace + type,
    email: id + "@org.com",
    balance: 100000,
    products: []
  };
  if(type === "Seller") {
    data["organisation"] = generateString();
  } else {
    data["firstName"] = generateString();
    data["lastName"] = generateString();
  }
  return data;
}

function composerCall(api, data, type) {
  if(type == "post") {
    return new Promise((resolve, reject) => {
      request.post(api, {
        json: data
      }, function(error, response, body) {
        if(error) reject(error);
        else resolve(body);
      });
    });
  } else {
    var options = {
      url: api,
      headers: {
        'content-type': 'application/json'
      }
    };
    return new Promise((resolve, reject) => {
      request(options, function(error, response, body) {
        //console.log(body);
        if(error) reject(error);
        else resolve(body);
      });
    });
  }
}

function generateNumber() {
  return Math.floor(1000 + Math.random() * 9000);
}

function generateString() {
  return Math.random().toString(36).substring(5);
}

function sleep(delay) {
  var start = new Date().getTime();
  while(new Date().getTime() < start + delay);
}
//function
server.listen(port, function() {
  console.log('Server running on port: %d', port);
});