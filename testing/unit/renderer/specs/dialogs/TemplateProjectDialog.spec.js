import { createVue } from '../../utils/VueUtils';
import TemplateProjectDialog from '@/renderer/components/dialogs/TemplateProjectDialog.vue';
import Sinon from 'sinon';
import { EVENTS } from '@/contents';

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

  it('should call cancel callbacks', async () => {
    const wrapper = createVue(TemplateProjectDialog);
    const onCancel = Sinon.fake();

    await wrapper.setProps({ onCancel });
    wrapper.find('#cancelBtn').trigger('click');

    expect(onCancel.callCount).to.equal(1);
  });

  it('should call confirm with the correct results', async () => {
    const sendEvent = TemplateProjectDialog.methods.sendEvent;
    TemplateProjectDialog.methods.sendEvent = Sinon.stub();

    const wrapper = createVue(TemplateProjectDialog);

    await wrapper.find('#pixiOption').setChecked(true);

    const input = await wrapper.find('.urlInput');
    input.element.value = 'localhost:8080';

    wrapper.find('#confirmBtn').trigger('click');

    expect(TemplateProjectDialog.methods.sendEvent.callCount).to.equal(1);

    const args = TemplateProjectDialog.methods.sendEvent.args[0];
    const event = args[0];
    const results = args[1];

    expect(event).to.equal(EVENTS.CREATE_PROJECT_TEMPLATE);
    expect(results.type).to.equal('pixi');
    expect(results.location).to.equal('localhost:8080\/New SpringRoll Game');

    TemplateProjectDialog.methods.sendEvent = sendEvent;
  });

});