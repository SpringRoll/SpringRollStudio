import { createVue } from '../../utils/VueUtils';
import FileExplorer from '@/renderer/components/caption-studio/FileExplorer.vue';
import { EventBus } from '@/renderer/class/EventBus';
import Sinon from 'sinon';

const file = {'name':'title.mp3','fullPath':'/Full/path/to/title.mp3','relativePath':'path/to/title.mp3','type':{'ext':'mp3','mime':'audio/mpeg'}};

//TODO: sort out how to test this properly
// describe('FileExplorer.js', () => {

//   it('setup() should create captionPlayer successfully', () => {
//     const wrapper = createVue(FileExplorer);
//   });
// });