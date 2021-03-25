import { createVue } from '../../utils/VueUtils';
import JsonPreview from '@/renderer/components/caption-studio/JsonPreview.vue';
import { EventBus } from '@/renderer/class/EventBus';
import Sinon from 'sinon';
import { captionData } from '../../utils/data';


describe('JsonPreview.js', () => {

  it('should recieve all events properly', async () => {
    const onUpdate = JsonPreview.methods.onUpdate;
    const onCaptionChange = JsonPreview.methods.onCaptionChange;
    const update = JsonPreview.methods.update;
    const createFileNameMap = JsonPreview.methods.createFileNameMap;
    const onSave = JsonPreview.methods.onSave;

    JsonPreview.methods.onUpdate = Sinon.stub();
    JsonPreview.methods.onCaptionChange = Sinon.stub();
    JsonPreview.methods.update = Sinon.stub();
    JsonPreview.methods.createFileNameMap = Sinon.stub();
    JsonPreview.methods.onSave = Sinon.stub();

    const wrapper = createVue(JsonPreview);

    EventBus.$emit('caption_update');
    EventBus.$emit('caption_changed');
    EventBus.$emit('caption_data');
    EventBus.$emit('file_list_generated');
    EventBus.$emit('saveCaptionData');

    await wrapper.vm.$nextTick();

    expect(JsonPreview.methods.onUpdate.callCount).to.equal(1);
    expect(JsonPreview.methods.onCaptionChange.callCount).to.equal(1);
    expect(JsonPreview.methods.update.callCount).to.equal(1);
    expect(JsonPreview.methods.createFileNameMap.callCount).to.equal(1);
    expect(JsonPreview.methods.onSave.callCount).to.equal(1);

    JsonPreview.methods.onUpdate = onUpdate;
    JsonPreview.methods.onCaptionChange = onCaptionChange;
    JsonPreview.methods.update = update;
    JsonPreview.methods.createFileNameMap = createFileNameMap;
    JsonPreview.methods.onSave = onSave;
  });


  it('onEdit()', () => {
    //just calls another method and emits that data. ignore for now
  });

  it('onSave()', () => {

  });

  it('onCaptionFileOpen()', () => {
  });

  it('onMenuClear()', () => {
  });

  it('onUpdate()', () => {
  });

  it('onEvent()', () => {
  });

  it('onCaptionChange()', () => {
  });

  it('update()', () => {
  });

  it('createFileNameMap()', () => {
  });

  it('cleanData()', () => {
  });

  it('createBlob()', () => {
  });

  it('reset()', () => {
  });

  it('validateJSON()', () => {
  });

  it('checkErrors()', () => {
  });

});