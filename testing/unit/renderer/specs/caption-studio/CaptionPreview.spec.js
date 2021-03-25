import { createVue } from '../../utils/VueUtils';
import CaptionPreview from '@/renderer/components/caption-studio/CaptionPreview.vue';
import { EventBus } from '@/renderer/class/EventBus';
import Sinon from 'sinon';

describe('CaptionPreview.js', () => {

  it('setup() should create captionPlayer successfully', () => {
    const wrapper = createVue(CaptionPreview);
    expect(wrapper.vm.captionPlayer);
  });

  it('should recieve all events properly', async () => {
    const setActiveCaption = CaptionPreview.methods.setActiveCaption;
    const loadCaptionData = CaptionPreview.methods.loadCaptionData;
    const onTimeChange = CaptionPreview.methods.onTimeChange;
    const setup = CaptionPreview.methods.setup;

    CaptionPreview.methods.setActiveCaption = Sinon.stub();
    CaptionPreview.methods.loadCaptionData = Sinon.stub();
    CaptionPreview.methods.onTimeChange = Sinon.stub();
    CaptionPreview.methods.setup = Sinon.stub();

    const wrapper = createVue(CaptionPreview);

    EventBus.$emit('caption_changed');
    EventBus.$emit('caption_data');
    EventBus.$emit('time_current');
    EventBus.$emit('caption_reset');

    await wrapper.vm.$nextTick();

    expect(CaptionPreview.methods.setActiveCaption.callCount).to.equal(1);
    expect(CaptionPreview.methods.loadCaptionData.callCount).to.equal(1);
    expect(CaptionPreview.methods.onTimeChange.callCount).to.equal(1);
    expect(CaptionPreview.methods.setup.callCount).to.equal(2); //this is also called on Mounted.

    CaptionPreview.methods.setActiveCaption = setActiveCaption;
    CaptionPreview.methods.loadCaptionData = loadCaptionData;
    CaptionPreview.methods.onTimeChange = onTimeChange;
    CaptionPreview.methods.setup = setup;
  });

  it('computed properties should update as expected', async () => {
    const wrapper = createVue(CaptionPreview);

    expect(wrapper.vm.atEnd).to.be.true;
    expect(wrapper.vm.atStart).to.be.true;

    EventBus.$emit('caption_changed', { name: 'Test', index: 1, lastIndex: 2 });
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.atEnd).to.be.false;
    expect(wrapper.vm.atStart).to.be.false;

    EventBus.$emit('caption_changed', { name: 'Test', index: 0, lastIndex: 2 });
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.atEnd).to.be.false;
    expect(wrapper.vm.atStart).to.be.true;

    EventBus.$emit('caption_changed', { name: 'Test', index: 2, lastIndex: 2 });
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.atEnd).to.be.true;
    expect(wrapper.vm.atStart).to.be.false;
  });

  it('setActiveCaption() should properly set data value when recieving event', async () => {
    const wrapper = createVue(CaptionPreview);

    expect(wrapper.vm.name).to.equal('');
    expect(wrapper.vm.index).to.equal(0);
    expect(wrapper.vm.lastIndex).to.equal(0);

    EventBus.$emit('caption_changed', { name: 'Test', index: 2, lastIndex: 1 });

    await wrapper.vm.$nextTick();

    expect(wrapper.vm.name).to.equal('Test');
    expect(wrapper.vm.index).to.equal(2);
    expect(wrapper.vm.lastIndex).to.equal(1);
  });
});