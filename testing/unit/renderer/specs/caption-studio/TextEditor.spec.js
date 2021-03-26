import { createVue } from '../../utils/VueUtils';
import TextEditor from '@/renderer/components/caption-studio/TextEditor.vue';
import { EventBus } from '@/renderer/class/EventBus';
import Sinon from 'sinon';
import { files, active, badCaptions } from '../../utils/data';


describe('TextEditor.js', () => {

  it('Component should mount properly', () => {
    const wrapper = createVue(TextEditor);
  });

  it('should recieve all events properly', async () => {
    const onUpdate = TextEditor.methods.onUpdate;
    const reset = TextEditor.methods.reset;
    const onJsonErrors = TextEditor.methods.onJsonErrors;

    TextEditor.methods.onUpdate = Sinon.stub();
    TextEditor.methods.reset = Sinon.stub();
    TextEditor.methods.onJsonErrors = Sinon.stub();

    const wrapper = createVue(TextEditor);

    EventBus.$emit('caption_changed');
    EventBus.$emit('caption_reset');
    EventBus.$emit('json_errors');

    await wrapper.vm.$nextTick();

    expect(TextEditor.methods.onUpdate.callCount).to.equal(1);
    expect(TextEditor.methods.reset.callCount).to.equal(1);
    expect(TextEditor.methods.onJsonErrors.callCount).to.equal(1);

    TextEditor.methods.onUpdate = onUpdate;
    TextEditor.methods.reset = reset;
    TextEditor.methods.onJsonErrors = onJsonErrors;
  });

});