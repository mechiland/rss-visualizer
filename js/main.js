function Feeds() {
  
  this.feeds = [];
  
  this._fetchedCount = 0;
  
  this.add = function(feed) {
    this.feeds.push(feed);
  }
  
  this.empty = function() {
    return this.feeds.length == 0;
  }
  
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
  } 
  
  this.fetch = function(feedUrl, callback) {
    var _this = this;
    var feed = new google.feeds.Feed(feedUrl);
    feed.setNumEntries(1);
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

function RSSVisualizer() {
  
  this.feedUrls = ["http://cn.engadget.com/rss.xml", "http://news.ycombinator.com/rss"];
  this.F = new Feeds();
  this._lastIndex = 0;
  this.interval = 3; // every second
  this.entries = [];
  this.lastShow = "a1";
  
  this.start = function(feedUrls) {
    var urls = feedUrls || this.feedUrls;
    var _this = this;
    this.F.fetchAll(urls, function() {
      _this.entries = _this.F.entries();
      setInterval(function() {
        _this.playRSS();
      }, _this.interval * 1000);
    });
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
    if (entry.feed_title == "Hacker News") {
      return "";
    } 
    var regexp_img = /<img [^>]+>/ig;
    var matched = entry.content.match(regexp_img);
    var img = "";
    if (matched) {
      img = matched[0];
    }
    return img + entry.content.replace(/<[^>]+>/img, '');
  }
  
  
}