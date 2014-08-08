var RecordNotUniqueError = require("../lib/record_not_unique_error");

module.exports = function(app) {
  var Publication = app.Models.Publication,
      Notebook = app.Models.Notebook;

  return {
    index: function(req, res, next) {
      Publication.forge()
      .fetchAll({ withRelated: 'notebook' })
      .then(res.json.bind(res))
      .catch(next);
    },

    get: function(req, res, next) {
      Publication.forge({ id: req.params.id })
      .fetch({ withRelated: 'notebook' })
      .then(res.json.bind(res))
      .catch(next);
    },

    create: function(req, res, next) {
      Notebook.forge({ id: req.body.id, userId: req.user.id })
      .fetch({ require: true })
      .then(function(notebook) {
        return notebook.save({ description: req.body.description }, { patch: true });
      })
      .then(function(notebook) {
        return notebook.getData().then(function(data) {
          return Publication.forge({
            notebookId: req.body.id,
            contents: data,
          })
          .save();
        });
      })
      .then(function(notebook) {
        Notebook.forge({ id: req.body.id })
        .fetch({ withRelated: 'publication' })
        .then(res.json.bind(res));
      })
      .catch(Notebook.NotFoundError, function() {
        return res.send(404);
      })
      .catch(next);
    },

    destroy: function(req, res, next) {
      req.user.publications()
      .query({where: {'publications.id': req.params.id}})
      .fetchOne()
      .then(function(publication) {
        return publication.destroy()
        .then(res.json.bind(res));
      })
      .catch(next);
    },

    copy: function(req, res, next) {
      req.user.projects()
      .query({where: {id: req.body.projectId}})
      .fetchOne({ require: true })
      .then(function(project) {
        return Publication.forge({ id: req.params.id })
        .fetch({ require: true })
        .then(function(publication) {
          return Notebook.forge({
            projectId: project.id,
            userId: req.user.id,
            name: req.body.name,
            data: JSON.parse(publication.get('contents'))
          })
          .save()
          .then(res.json.bind(res));
        })
      })
      .catch(app.Models.Project.NotFoundError, function() {
        return res.send(404);
      })
      .catch(function(e) {
        if (e instanceof RecordNotUniqueError) {
          return res.status(409).json({ error: 'That name is already taken by another notebook in that project' });
        }
        return next(e);
      })
    }
  }
};