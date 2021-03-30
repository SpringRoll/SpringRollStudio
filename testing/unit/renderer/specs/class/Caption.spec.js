import { Caption } from '../../../../../src/renderer/class/Caption';

describe('Caption.js', () => {
  it('Caption should still instantiate with only a name', () => {
    const caption = new Caption('nameOnly');

    const captionData = caption.getData();
    expect(captionData.content).to.equal(' ');
    expect(captionData.end).to.equal(0);
    expect(captionData.start).to.equal(0);
  });

  it('Constructor should use updateContent() to set caption info', () => {
    const caption = new Caption( 'testCaption', {
      content: 'test-caption-line',
      end: 10,
      start: 0
    });

    let captionData = caption.getData();
    expect(captionData.content).to.equal('test-caption-line');
    expect(captionData.end).to.equal(10);
    expect(captionData.start).to.equal(0);

    caption.updateContent({start: 10, end: 20});

    captionData = caption.getData();
    expect(captionData.content).to.equal('test-caption-line');
    expect(captionData.end).to.equal(20);
    expect(captionData.start).to.equal(10);

  });
});