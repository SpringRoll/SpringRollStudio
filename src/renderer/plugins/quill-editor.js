import Vue from 'vue';
import Quill from 'quill';
import VueQuillEditor from 'vue-quill-editor';

// require styles
import 'quill/dist/quill.core.css';
import 'quill/dist/quill.snow.css';
import 'quill/dist/quill.bubble.css';
import './quill-editor.scss';
const Size = Quill.import('attributors/style/size');

Size.whitelist = ['10px', '14px', '16px', '18px', '21px', '23px', '32px'];

Quill.register(Quill.import('attributors/style/align'), true);
Quill.register(Quill.import('attributors/style/background'), true);
Quill.register(Quill.import('attributors/style/color'), true);
Quill.register(Quill.import('attributors/style/direction'), true);
Quill.register(Quill.import('attributors/style/font'), true);
Quill.register(Size, true);

Vue.use(VueQuillEditor, {
  placeholder: '',
  modules: {
    toolbar: '#toolbar'
  },
  formats: {
    size: '20rem'
  }
});
