import { createVue } from '../../utils/VueUtils';
import PreviewTargetDialog from '@/renderer/components/dialogs/PreviewTargetDialog.vue';
import Sinon from 'sinon';

describe('PreviewTargetDialog.js', () => {

  it('dialog should not be initially visible', () => {
    const wrapper = createVue(PreviewTargetDialog);
    expect(wrapper.find('.dialog').element.style.display).to.equal('none');
  });

  it('dialog should be visible after setting the "visible" property', async () => {
    const wrapper = createVue(PreviewTargetDialog);
    await wrapper.setProps({ visible: true });
    expect(wrapper.find('.dialog').element.style.display).to.not.equal('none');
  });

  it('should set the preview types', () => {
    const setPreviewType = PreviewTargetDialog.methods.setPreviewType;
    PreviewTargetDialog.methods.setPreviewType = Sinon.stub();

    const wrapper = createVue(PreviewTargetDialog);

    wrapper.find('#deployOption').trigger('change');
    expect(PreviewTargetDialog.methods.setPreviewType.calledWith('deploy')).to.equal(true);

    wrapper.find('#urlOption').trigger('change');
    expect(PreviewTargetDialog.methods.setPreviewType.calledWith('url')).to.equal(true);

    expect(PreviewTargetDialog.methods.setPreviewType.callCount).to.equal(2);
    PreviewTargetDialog.methods.setPreviewType = setPreviewType;
  });

  it('should call confirm and cancel callbacks', async () => {
    const wrapper = createVue(PreviewTargetDialog);
    const onConfirm = Sinon.fake();
    const onCancel = Sinon.fake();

    await wrapper.setProps({ onConfirm, onCancel });

    wrapper.find('#confirmBtn').trigger('click');
    wrapper.find('#cancelBtn').trigger('click');

    expect(onConfirm.callCount).to.equal(1);
    expect(onCancel.callCount).to.equal(1);
  });

  it('should call confirm with the correct results', async () => {
    const wrapper = createVue(PreviewTargetDialog);
    const onConfirm = Sinon.fake();

    await wrapper.setProps({ onConfirm });
    await wrapper.find('#urlOption').setChecked(true);
    await wrapper.find('#urlInput').setValue('localhost:8080');

    wrapper.find('#confirmBtn').trigger('click');

    const results = onConfirm.args[0][0];

    expect(results.type).to.equal('url');
    expect(results.url).to.equal('localhost:8080');
  });
});