module.exports = function() {
  var World = this;

  this.Widgets.Publication = this.Widget.extend({
    root: '.publication',

    name: function() {
      return this.read('.name');
    },

    description: function() {
      return this.read('.description');
    },

    goToOpenInBunsen: function() {
      return this.click('.copy-notebook');
    }
  });

  this.Widgets.copyNotebookModal = this.Widget.extend({
    root: 'modal',

    selectProject: function(project) {
      return this.click('select').then(function() {
        return this.find('select').then(function(select) {
          return new World.Widget({ el: select }).findByText(project)
          .then(function(option) {
            return option.click();
          });
        });
      }.bind(this));
    },

    nameNotebook: function(name) {
      return this.fill('.name', name);
    }
  });

  this.Widgets.PublicationListItem = this.Widget.extend({
    root: '.bunsen-list-item',

    name: function() {
      return this.read('h2 a');
    }
  });

  this.Widgets.PublicationList = this.Widget.List.extend({
    root: '.publication-list',
    itemSelector: '.bunsen-list-item',
    itemClass: this.Widgets.PublicationListItem,

    clickAt: function(index) {
      return this.at(index).then(function(item) {
        return item.click('a.title');
      });
    }
  });

  this.Widgets.PublicationSearch = this.Widget.extend({
    root: '.publication-search',

    search: function(text) {
      return this.fill(text);
    }
  });

  this.Widgets.PublicationCategoriesList = this.Widget.List.extend({
    root: '.publication-categories',

    clickCategory: function(category) {
      return this.findByText(category).then(function(categoryLink) {
        return categoryLink.click();
      });
    }
  });
};