import { createVue } from '../../utils/VueUtils';
import FileDirectory from '@/renderer/components/caption-studio/FileDirectory.vue';
import { EventBus } from '@/renderer/class/EventBus';
import Directory from '@/renderer/class/Directory';
import Sinon from 'sinon';
import { directory, active } from '../../utils/data';

describe('FileDirectory.vue', () => {

  it('should recieve all events properly', async () => {
    const nextFile = FileDirectory.methods.nextFile;
    const previousFile = FileDirectory.methods.previousFile;
    const onFileCaptionChange = FileDirectory.methods.onFileCaptionChange;
    const jsonEmit = FileDirectory.methods.jsonEmit;

    FileDirectory.methods.nextFile = Sinon.stub();
    FileDirectory.methods.previousFile = Sinon.stub();
    FileDirectory.methods.onFileCaptionChange = Sinon.stub();
    FileDirectory.methods.jsonEmit = Sinon.stub();

    const wrapper = createVue(FileDirectory, {
      propsData: {
        directory,
        active
      }
    });

    EventBus.$emit('next_file');
    EventBus.$emit('previous_file');
    EventBus.$emit('file_captioned');
    EventBus.$emit('json_file_selected');

    await wrapper.vm.$nextTick();

    expect(FileDirectory.methods.nextFile.callCount).to.equal(1);
    expect(FileDirectory.methods.previousFile.callCount).to.equal(1);
    expect(FileDirectory.methods.onFileCaptionChange.callCount).to.equal(1);
    expect(FileDirectory.methods.jsonEmit.callCount).to.equal(1);

    FileDirectory.methods.nextFile = nextFile;
    FileDirectory.methods.previousFile = previousFile;
    FileDirectory.methods.onFileCaptionChange = onFileCaptionChange;
    FileDirectory.methods.jsonEmit = jsonEmit;
  });

  it('when a file is selected hasActive should update properly', async () => {
    //directory__select
    const wrapper = createVue(FileDirectory, {
      propsData: {
        directory,
        active
      }
    });

    expect(wrapper.vm.hasActive).to.be.false;

    const input = wrapper.find('.directory__select');
    input.element.checked = true;
    input.trigger('change');
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.hasActive).to.be.true;
  });
});