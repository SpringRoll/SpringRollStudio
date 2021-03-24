import { createVue } from '../../utils/VueUtils';
import { EVENTS, DIALOGS } from '@/constants';
import CaptionStudio from '@/renderer/components/pages/CaptionStudio.vue';
import Sinon from 'sinon';

import FileExplorer from '@/renderer/components/caption-studio/FileExplorer';
import WaveSurfer from '@/renderer/components/caption-studio/WaveSurfer';
import TextEditor from '@/renderer/components/caption-studio/TextEditor';
import JsonPreview from '@/renderer/components/caption-studio/JsonPreview';
import CaptionPreview from '@/renderer/components/caption-studio/CaptionPreview';
import FileProcessor from '@/renderer/class/FileProcessor';

// describe('CaptionStudio.js', () => {

//   it('should mount and render', () => {
//     const wrapper = createVue(TextEditor);
//     //expect(wrapper.find('.name').text()).to.equal('SpringRoll Studio');
//   });
// });