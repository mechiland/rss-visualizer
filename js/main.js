function Feeds() {
  
  this.feeds = [];
  
  this._fetchedCount = 0;
  
  this.add = function(feed) {
    this.feeds.push(feed);
  };
  
  this.empty = function() {
    return this.feeds.length == 0;
  };
  
  this.entries = function() {
    var entries = [];
    for (var i = 0; i < this.feeds.length; i++) {
      var f = this.feeds[i];
      for (var j = 0; j < f.entries.length; j++) {
        var e = f.entries[j];
        e.feed_title = f.title;
        entries.push(e);
      }
    }
    return entries;
  };
  
  this.randomizedEntries = function() {
    return this.randomize(this.entries());
  }
  
  this.randomize = function(myArray) {
    var i = myArray.length;
    if ( i == 0 ) return false;
    while ( --i ) {
       var j = Math.floor( Math.random() * ( i + 1 ) );
       var tempi = myArray[i];
       var tempj = myArray[j];
       myArray[i] = tempj;
       myArray[j] = tempi;
     }
    return myArray;
  }
  
  this.fetch = function(feedUrl, callback) {
    var _this = this;
    var feed = new google.feeds.Feed(feedUrl);
    feed.setNumEntries(50);
    feed.includeHistoricalEntries();
    feed.load(function(result) {
      if (!result.error) {
        _this.add(result.feed);
      }
      callback();
    });
  }
  
  this.fetchAll = function(feedUrls, callback) {
    var _this = this;
    for (var i = 0; i < feedUrls.length; i++) {
      this.fetch(feedUrls[i], function() {
        _this._fetchedCount++;
        if (_this._fetchedCount == feedUrls.length) {
          callback();
        }
      })
    }
  }
}

function RSSVisualizer(feedUrls) {
  
  this.feedUrls = feedUrls || ["http://cn.engadget.com/rss.xml", "http://news.ycombinator.com/rss"];
  this.F = new Feeds();
  this._lastIndex = 0;
  this.readingTime = 7; // every second
  this.entries = [];
  this.lastShow = "a1";
  this._interval = -1;
  
  this.start = function() {
    var _this = this;
    this.F.fetchAll(this.feedUrls, function() {
      _this.entries = _this.F.randomizedEntries();
      this._interval = setInterval(function() {
        $("#loading").hide();
        _this.playRSS();
      }, _this.readingTime * 1000);
    });
  };
  
  this.stop = function() {
    clearInterval(this._interval);
  };
  
  this.restart = function() {
    this.stop();
    var _this = this;
    setTimeout(function() {
      _this.start();
    }, 100);
  };
  
  this.playRSS = function() {
    if (this.entries.length == 0) return;
    if (this._lastIndex == this.entries.length) this._lastIndex = 0;
    var e = this.entries[this._lastIndex++];
    $(this.lastShow).addClass("hide");
    var thisShow = (this.lastShow == "#a1" ? "#a2" : "#a1");
    this.showSingle(thisShow, e);
    this.lastShow = thisShow;
  };
  
  this.showSingle = function(container, entry) {
    $(container).children(".from").text(entry.feed_title);
    $(container).children("h2").text(entry.title);
    $(container).children(".content").html(this.renderContent(entry));
    $(container).removeClass("hide");
  };
  
  this.renderContent = function(entry) {
    var bgcolor = "#0576dc";
    var content = entry.content;
    
    if (entry.feed_title == "Hacker News") {
      //bgcolor = "#F60";
      content = "";
    } else if (entry.feed_title == "Planet TW") {
      bgcolor = "#6C649C";
      content = entry.content.substring(0, 500);
    } else {
      var regexp_img = /<img [^>]+>/ig;
      var matched = entry.content.match(regexp_img);
      var img = "";
      if (matched) {
        img = matched[0];
      }

      content = img + entry.content.replace(/<[^>]+>/img, '').substring(0, 100) + "...";
    }
    
    $("body").css("background-color", bgcolor);
    return content;
  }
  
  
}