import { createVue } from '../../utils/VueUtils';
import TemplateProjectDialog from '@/renderer/components/dialogs/TemplateProjectDialog.vue';
import Sinon from 'sinon';

describe('TemplateProjectDialog.js', () => {

  it('dialog should not be initially visible', () => {
    const wrapper = createVue(TemplateProjectDialog);
    expect(wrapper.find('.dialog').element.style.display).to.equal('none');
  });

  it('dialog should be visible after setting the "visible" property', async () => {
    const wrapper = createVue(TemplateProjectDialog);
    await wrapper.setProps({ visible: true });
    expect(wrapper.find('.dialog').element.style.display).to.not.equal('none');
  });

  it('should set the template type', () => {
    const setTemplateType = TemplateProjectDialog.methods.setTemplateType;
    TemplateProjectDialog.methods.setTemplateType = Sinon.stub();

    const wrapper = createVue(TemplateProjectDialog);

    wrapper.find('#pixiOption').trigger('change');
    expect(TemplateProjectDialog.methods.setTemplateType.calledWith('pixi')).to.equal(true);

    wrapper.find('#phaserOption').trigger('change');
    expect(TemplateProjectDialog.methods.setTemplateType.calledWith('phaser')).to.equal(true);

    wrapper.find('#createjsOption').trigger('change');
    expect(TemplateProjectDialog.methods.setTemplateType.calledWith('createjs')).to.equal(true);

    expect(TemplateProjectDialog.methods.setTemplateType.callCount).to.equal(3);
    TemplateProjectDialog.methods.setTemplateType = setTemplateType;
  });

  it('should call confirm and cancel callbacks', async () => {
    const wrapper = createVue(TemplateProjectDialog);
    const onConfirm = Sinon.fake();
    const onCancel = Sinon.fake();

    await wrapper.setProps({ onConfirm, onCancel });

    wrapper.find('#confirmBtn').trigger('click');
    wrapper.find('#cancelBtn').trigger('click');

    expect(onConfirm.callCount).to.equal(1);
    expect(onCancel.callCount).to.equal(1);
  });

  it('should call confirm with the correct results', async () => {
    const wrapper = createVue(TemplateProjectDialog);

    const sendEvent = TemplateProjectDialog.methods.sendEvent;
    TemplateProjectDialog.methods.sendEvent = Sinon.stub();

    await wrapper.find('#pixiOption').setChecked(true);
    await wrapper.find('.urlInput').setValue('path/to/project');
    await wrapper.find('#confirmBtn').trigger('click');

    expect(TemplateProjectDialog.methods.sendEvent.callCount).to.equal(1);

    const results = TemplateProjectDialog.methods.sendEvent.args[0][0];

    expect(results.type).to.equal('pixi');
    expect(results.location).to.equal('path/to/project');

    TemplateProjectDialog.methods.sendEvent = sendEvent;
  });

});