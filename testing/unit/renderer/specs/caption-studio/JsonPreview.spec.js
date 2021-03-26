import { createVue } from '../../utils/VueUtils';
import JsonPreview from '@/renderer/components/caption-studio/JsonPreview.vue';
import { EventBus } from '@/renderer/class/EventBus';
import Sinon from 'sinon';
import { files, active, badCaptions } from '../../utils/data';


describe('JsonPreview.js', () => {

  it('Component should mount properly', () => {
    const wrapper = createVue(JsonPreview);
    wrapper.destroy();
  });

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
    wrapper.destroy();
  });


  it('onCaptionChange()', async () => {
    const wrapper = createVue(JsonPreview);

    expect(wrapper.vm.currentIndex).to.equal(0);
    expect(wrapper.vm.activeFile).to.equal('');
    expect(wrapper.vm.fileNameMap['title.mp3']).to.undefined;

    EventBus.$emit('caption_changed', { name: active.name, file: active, index: 1});
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.currentIndex).to.equal(1);
    expect(wrapper.vm.activeFile).to.equal('title.mp3');
    expect(wrapper.vm.fileNameMap['title.mp3'].fullPath).to.equal(active.fullPath);
    wrapper.destroy();

  });

  it('update() should call all methods properly', async () => {
    const checkErrors = JsonPreview.methods.checkErrors;
    const cleanData = JsonPreview.methods.cleanData;
    const createBlob = JsonPreview.methods.createBlob;

    JsonPreview.methods.checkErrors = Sinon.stub();
    JsonPreview.methods.cleanData = Sinon.stub().returnsArg(0);
    JsonPreview.methods.createBlob = Sinon.stub();

    const wrapper = createVue(JsonPreview);

    //run with origin !== 'userOpen'
    EventBus.$emit('caption_data', {data: { caption: 'caption' } }, 'test' );
    await wrapper.vm.$nextTick();

    expect(JsonPreview.methods.cleanData.callCount).to.equal(1);
    expect(JsonPreview.methods.checkErrors.callCount).to.equal(1);
    expect(JsonPreview.methods.createBlob.callCount).to.equal(2); //called once on mounted as well      vb
    expect(wrapper.vm.data.data.caption).to.equal('caption');

    //run with origin !== 'userOpen'
    EventBus.$emit('caption_data', {data: { caption: 'caption' } }, 'userOpen' );

    await wrapper.vm.$nextTick();

    expect(JsonPreview.methods.cleanData.callCount).to.equal(2);
    expect(JsonPreview.methods.checkErrors.callCount).to.equal(3); //called an extra time when emitting because of origin === userOpen
    expect(JsonPreview.methods.createBlob.callCount).to.equal(3); //called once on mounted as well      vb
    expect(wrapper.vm.data.data.caption).to.equal('caption');

    JsonPreview.methods.checkErrors = checkErrors;
    JsonPreview.methods.cleanData = cleanData;
    JsonPreview.methods.createBlob = createBlob;
    wrapper.destroy();
  });

  it('update() should clean and prepare data using checkErrors() and cleanData()', async () => {
    const wrapper = createVue(JsonPreview);
    EventBus.$emit('caption_data', badCaptions, 'test' );
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.data['bad-caption']).to.be.undefined; // bad-caption should be removed
    expect(wrapper.vm.data['good-caption'][0].content).to.equal('good-caption'); // confirm good-caption still exists
    expect(wrapper.vm.jsonErrors).to.be.false; //clean data should remove any captions with errors
    wrapper.destroy();
  });

  it('createFileNameMap()', async () => {
    const wrapper = createVue(JsonPreview);

    EventBus.$emit('file_list_generated', files);

    await wrapper.vm.$nextTick();
    expect(wrapper.vm.fileNameMap.title.name).to.equal(files[0].name); //title and title.mp3
    wrapper.destroy();
  });
});