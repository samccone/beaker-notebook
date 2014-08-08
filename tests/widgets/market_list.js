module.exports = function() {
  this.Widgets.MarketList = this.Widget.List.extend({
    root: '.market-list',
    itemSelector: '.bunsen-list-item',

    contents: function() {
      return $.map(this.items(), function(n) {
        return $.all([n.find(".title"), n.find(".description"), n.find(".format"), n.find('.vendors')])
        .then(function(arr) {
          return $.all(_.invoke(arr, 'getText'))
          .then(function(text) {
            return {
              title: text[0].toLowerCase(),
              description: text[1].toLowerCase(),
              format: text[2].toLowerCase(),
              vendors: text[3].toLowerCase()
            }
          });
        });
      });
    },

    select: function(index) {
      return this.items().then(function(items) {
        return items[0].click("a");
      });
    },

    contains: function(text) {
      return this.findAll(this.itemSelector + ' a.title').then(function(nodes) {
        return $.filter(nodes, function(n) {
          return n.getInnerHtml().then(function(t) {
            return text === t;
          });
        })
        .then(function(filtered) {
          return filtered.length > 0;
        });
      })
    },

    waitForItem: function() {
      return this.find(this.itemSelector);
    },

    clickItem: function(title) {
      var xpath = "return document.evaluate(\"//a[contains(text(),'" + title + "')]\", document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null).snapshotItem(0)";
      var _this = this;
      return this.waitForItem().then(function() {
        return _this.driver.executeScript(xpath).then(function(a) {
          return a.click();
        });
      });
    }
  });

  this.Widgets.MarketSidebar = this.Widget.extend({
    root: '.marketplace .sidebar-left',

    search: function(text) {
      return this.fill('.search', text);
    }
  });
};