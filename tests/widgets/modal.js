module.exports = function() {
  return this.Widgets.Modal = this.Widget.extend({
    root: 'modal',

    isDisplayed: function() {
      return this.isVisible();
    },

    accept: function() {
      return this.click('.accept');
    },

    cancel: function() {
      return this.click('.cancel');
    },

    submit: function() {
      return this.click('.submit');
    },

    close: function() {
      return this.find('.ng-modal-close').click();
    },

    closeFromBackground: function() {
      return this.find('.ng-modal-overlay').click();
    },

    errorMessage: function() {
      return this.read('.error');
    }
  });
}