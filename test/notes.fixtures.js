function makeNotesArray() {
  return [
    {
      id: 1,
      note_name: 'First test note',
      date_modified: '2029-01-22T16:28:32.615Z',
      content: 'Spectacular note info with lots of details',
      folder_id: 1
    },
    {
      id: 2,
      note_name: 'Second test note',
      date_modified: '2020-01-22T16:28:32.615Z',
      content: 'Amazing note info with lots of details',
      folder_id: 2
    },
    {
      id: 3,
      note_name: 'Third test note',
      date_modified: '2019-01-22T16:28:32.615Z',
      content: 'Great note info with lots of details',
      folder_id: 1
    },
    {
      id: 4,
      note_name: 'Fourth test note',
      date_modified: '2009-01-22T16:28:32.615Z',
      content: 'Good note info with lots of details',
      folder_id: 1
    },
  ];
}
  
module.exports = {
  makeNotesArray,
};