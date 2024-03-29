import Directory from '@/renderer/class/Directory';

export const captionData = {
  'acoustic-guitar': [
    {
      'content': 'Test',
      'start': 10,
      'end': 1190
    },
    {
      'content': ' test2',
      'start': 1190,
      'end': 1882
    }
  ],
  'bongos': [
    {
      'content': 'Springroll rocks!!',
      'start': 0,
      'end': 643
    }
  ],
  'title-audio': [
    {
      'content': ' title audio',
      'start': 0,
      'end': 2257
    }
  ],
  'bugle': [
    {
      'content': ' test',
      'start': 0,
      'end': 665
    }
  ]
};

export const directory = new Directory({'name':'music','files':[{'name':'title.mp3','fullPath':'/Full/path/to/title.mp3','relativePath':'path/to/title.mp3','type':{'ext':'mp3','mime':'audio/mpeg'}},{'name':'title.ogg','fullPath':'/Full/path/to/title.ogg','relativePath':'path/to/title.ogg','type':{'ext':'ogg','mime':'audio/ogg'}}],'directories':{}});

export const active = {'name':'title.mp3','fullPath':'/Full/path/to/title.mp3','relativePath':'path/to/title.mp3','type':{'ext':'mp3','mime':'audio/mpeg'}};

export const files = [{'name':'title.mp3','fullPath':'/Full/path/to/title.mp3','relativePath':'path/to/title.mp3','type':{'ext':'mp3','mime':'audio/mpeg'}}, {'name':'acoustic-guitar.mp3','fullPath':'/Full/path/to/acoustic-guitar.mp3','relativePath':'path/to/acoustic-guitar.mp3','type':{'ext':'mp3','mime':'audio/mpeg'}}];
export const addFile = {'name':'addFile.mp3','fullPath':'/Full/path/to/addFile.mp3','relativePath':'path/to/addFile.mp3','type':{'ext':'mp3','mime':'audio/mpeg'}};


export const badCaptions = {
  'bad-caption': [
    {
      'content': 'test',
      'start': 1120,
      'end': 0
    },
    {
      'content': '',
      'start': 1190,
      'end': 1882
    }
  ],
  'good-caption': [
    {
      'content': 'good-caption',
      'start': 0,
      'end': 643
    }
  ]
};