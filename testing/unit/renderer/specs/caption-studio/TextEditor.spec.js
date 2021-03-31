import { createVue } from '../../utils/VueUtils';
import { mount } from '@vue/test-utils';
import TextEditor from '@/renderer/components/caption-studio/TextEditor.vue';
import { EventBus } from '@/renderer/class/EventBus';
import Sinon from 'sinon';


describe('TextEditor.vue', () => {

  it('Component should createVue properly', () => {
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

  it('computed properites should all return as expected', async () => {

    const wrapper = createVue(TextEditor);

    expect(wrapper.vm.canAdd).to.be.false;
    expect(wrapper.vm.canRemove).to.be.false;
    expect(wrapper.vm.characterCount).to.equal(0);
    expect(wrapper.vm.lineCount).to.equal(0);

    EventBus.$emit('caption_changed', { data: { start: 10, end: 100, content: 'caption-content', edited: true}, index: 1, lastIndex: 1, name: 'test' }, 'test');
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.canAdd).to.be.true;
    expect(wrapper.vm.canRemove).to.be.false;
    expect(wrapper.vm.characterCount).to.equal(15);
    expect(wrapper.vm.lineCount).to.equal(0);

    EventBus.$emit('caption_changed', { data: { start: 10, end: 100, content: 'caption-content<br>line', edited: true}, index: 1, lastIndex: 2, name: 'test' }, 'test');
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.canAdd).to.be.false;
    expect(wrapper.vm.canRemove).to.be.true;
    expect(wrapper.vm.characterCount).to.equal(19);
    expect(wrapper.vm.lineCount).to.equal(1);
  });

});