const path = require('path');
const express = require('express');
const NotesService = require('./notes-service');
const xss = require('xss');
const notesRouter = express.Router();
const jsonParser = express.json();

const serializeNote = note => ({
  id: note.id,
  note_name: xss(note.note_name),
  content: xss(note.content),
  date_modified: note.date_modified,
  folder_id: note.folder_id,
});

notesRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db');
    NotesService.getAllNotes(knexInstance)
      .then(notes => {
        res.json(notes.map(serializeNote));
      })
      .catch(next);
  })
  .post(jsonParser, (req, res, next) => {
    const knexInstance = req.app.get('db');
    const {note_name, content, folder_id, date_modified} = req.body;
    const newNote = { note_name, content, folder_id };
    for (const [key, value] of Object.entries(newNote)) {
      if (value == null) {
        return res.status(400).json({
          error: {message: `Missing '${key}' in request body` }
        });
      }
      /*newNote.folder_id = Number(folder_id);
      if(date_modified) {
        newNote.date_modified = date_modified;
      }*/

      NotesService.insertNote(knexInstance, newNote)
        .then(note => {
          res.status(201)
            .location(path.posix.join(req.originalUrl, `/${note.id}`))
            .json(serializeNote(note));
        })
        .catch(next);
    }
  });

notesRouter
  .route('/:id')
  .all((req, res, next) => {
    NotesService.getById(
      req.app.get('db'),
      req.params.id
    )
      .then(note => {
        if (!note) {
          return res.status(404).json({
            error: {message: 'Note doesn\'t exist'}
          });
        }
        res.note = note;
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    res.json(serializeNote(res.note));
  })
  .delete((req, res, next) => {
    NotesService.deleteNote(
      req.app.get('db'),
      req.params.id
    )
      .then((numRowsAffected) => {
        res.status(204).end();
      })
      .catch(next);
  })

  .patch(jsonParser, (req, res, next) => {
    const { note_name, content, date_modified } = req.body;
    const noteToUpdate = {note_name, content, date_modified};
    const numberOfValues = Object.values(noteToUpdate).filter(Boolean).length;
    if (numberOfValues === 0) {
      return res.status(400).json({
        error: {
          message: 'Request body must contain either \'name\' or \'content\''
        }
      });
    }

    NotesService.updateNote(
      req.app.get('db'),
      req.params.id,
      noteToUpdate
    )
      .then(numRowsAffected => {
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = notesRouter;