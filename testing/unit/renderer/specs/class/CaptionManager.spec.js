import CaptionManager from '../../../../../src/renderer/class/CaptionManager';
import { EventBus } from '@/renderer/class/EventBus';
import { active, captionData } from '../../utils/data';

const activeName = active.name.replace(/.(ogg|mp3|mpeg)$/, '');

const sleep = (millis) => {
  return new Promise((resolve) => setTimeout(resolve, millis));
};

describe('CaptionManager.js', () => {

  it('fileChanged', async () => {
    EventBus.$emit('file_selected', {file: active});

    await sleep(10);

    expect(CaptionManager.file.name).to.equal(active.name);
    expect(CaptionManager.activeCaption).to.equal(activeName);
  });

  it('onJsonUpdate', async () => {
    EventBus.$emit('json_update', captionData);

    await sleep(10);

    //just confirm it was added properly
    expect(CaptionManager.data.bongos[0].content).to.equal(captionData.bongos[0].content);
  });

  it('addCaption', async () => {
    EventBus.$emit('caption_add');
    await sleep(10);
    expect(CaptionManager.activeCaption).to.equal(activeName);
    expect(CaptionManager.currentCaptionIndex.content).to.equal(' ');
    expect(CaptionManager.currentCaptionIndex.start).to.equal(0);
    expect(CaptionManager.currentCaptionIndex.end).to.equal(0);
  });

  it('addIndex()', () => {
    const previousIndex = CaptionManager.activeIndex;
    EventBus.$emit('caption_add_index');
    expect(previousIndex).to.be.lessThan(CaptionManager.activeIndex);
    //addIndex inserts a blank template in as the new Caption
    expect(CaptionManager.currentCaptionIndex.content).to.equal(' ');
    expect(CaptionManager.currentCaptionIndex.start).to.equal(0);
    expect(CaptionManager.currentCaptionIndex.end).to.equal(0);
  });

  it('updateActiveCaption()', () => {
    EventBus.$emit('caption_update', { start: 10, end: 100, content: 'new-caption-content'});
    expect(CaptionManager.currentCaptionIndex.content).to.equal('new-caption-content');
    expect(CaptionManager.currentCaptionIndex.start).to.equal(10);
    expect(CaptionManager.currentCaptionIndex.end).to.equal(100);
  });

  it('moveIndex()', () => {
    let previousIndex = CaptionManager.activeIndex;
    EventBus.$emit('caption_move_index', -1);

    expect(CaptionManager.activeIndex).to.equal(previousIndex - 1);
    previousIndex = CaptionManager.activeIndex;

    EventBus.$emit('caption_move_index', -100);
    expect(CaptionManager.activeIndex).to.equal(0);
    previousIndex = CaptionManager.activeIndex;

    EventBus.$emit('caption_move_index', 100);
    expect(CaptionManager.activeIndex).to.equal(CaptionManager.lastIndex);
    previousIndex = CaptionManager.activeIndex;
  });

  it('removeAtIndex()', () => {
    const captionContent = CaptionManager.currentCaptionIndex.content;
    const lastIndex = CaptionManager.lastIndex;
    EventBus.$emit('caption_remove_index');

    expect(CaptionManager.currentCaptionIndex.content).to.not.equal(captionContent);
    expect(CaptionManager.lastIndex).to.equal(lastIndex - 1);

  });

  it('reset()', () => {
    EventBus.$emit('caption_reset');

    expect(Object.keys(CaptionManager.data).length).to.equal(0);
    expect(CaptionManager.activeIndex).to.equal(0);
    expect(CaptionManager.activeCaption).to.equal('');
  });
});