/* eslint-disable no-console */
const path = require('path');
const express = require('express');
const FoldersService = require('./folders-service');
const foldersRouter = express.Router();
const jsonBodyParser = express.json();
const xss = require('xss');

const serializeFolder = folder => ({
  id: folder.id,
  folder_name: xss(folder.folder_name)
});

foldersRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db');
    FoldersService.getAllFolders(knexInstance)
      .then(folders => {
        res.json(folders.map(serializeFolder));
      })
      .catch(next);
  })
  
  .post(jsonBodyParser, (req, res, next) => {
    const knexInstance = req.app.get('db');
    const { folder_name } = req.body;
    const newFolder = { folder_name };
    if (folder_name == null || folder_name.length < 1) {
      return res.status(400).json({
        error: { message: 'Missing folder name' }
      });
    }
    FoldersService.insertFolder(knexInstance, newFolder)
      .then(folder => {
        res.status(201)
          .location(path.posix.join(req.originalUrl, `/${folder.id}`))
          .json(serializeFolder(folder));
      })
      .catch(next);
  });

foldersRouter
  .route('/:id')
  .get((req, res, next) => {
    const folderId = req.params.id;
    console.log(folderId, 'this is folder id from folder router');
    FoldersService.getById(
      req.app.get('db'),
      folderId
      //req.params.id
    )
      .then(folder => {
        if (!folder) {
          return res.status(404).json({
            error: { message: 'Folder does not exist' }
          });
        }
        res.json(serializeFolder(folder));
        //next();
      })
      .catch(next);
  })
// .get((req, res, next) => {
//   res.json(serializeFolder(res.folder));
// })

  .delete((req, res, next) => {
    const knexInstance = req.app.get('db');
    FoldersService.deleteFolder(knexInstance, req.params.id)
      .then(numRowsAffected => {
        res.status(204).end();
      })
      .catch(next);
  })

  .patch(jsonBodyParser, (req, res, next) => {
    const knexInstance = req.app.get('db');
    const { folder_name } = req.body;
    const folderToUpdate = { folder_name };
    const numberOfValues = Object.values(folderToUpdate).filter(Boolean).length;
    if (numberOfValues === 0) {
      return res.status(400).json({
        error: {
          message: 'Request body must contain a valid folder name'
        }
      });
    }


    FoldersService.updateFolder(
      knexInstance,
      req.params.id,
      folderToUpdate
    )
      .then(numRowsAffected => {
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = foldersRouter;