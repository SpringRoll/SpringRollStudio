import { createVue } from '../../utils/VueUtils';
import { EVENTS, DIALOGS } from '@/contants';
import LandingPage from '@/renderer/components/pages/LandingPage.vue';
import Sinon from 'sinon';

describe('LandingPage.js', () => {
  const sendEvent = LandingPage.methods.sendEvent;

  afterEach(() => {
    LandingPage.methods.sendEvent = sendEvent;
  });

  it('should mount and render', () => {
    const wrapper = createVue(LandingPage);
    expect(wrapper.find('.name').text()).to.equal('SpringRoll Studio');
  });

  it('should dispatch EVENTS.OPEN_DIALOG with parameter DIALOGS.PROJECT_LOCATION_SETTER', () => {
    LandingPage.methods.sendEvent = Sinon.stub();

    const wrapper = createVue(LandingPage);
    wrapper.find('.projectLocationBtn').trigger('click');

    expect(LandingPage.methods.sendEvent.calledWith(EVENTS.OPEN_DIALOG, DIALOGS.PROJECT_LOCATION_SETTER)).to.equal(true);
  });

  it('preview game button should toggle the preview target dialog', () => {
    const toggle = LandingPage.methods.togglePreviewTargetDialog;
    LandingPage.methods.togglePreviewTargetDialog = Sinon.stub();

    const wrapper = createVue(LandingPage);
    const btn = wrapper.find('.previewGameBtn');

    btn.element.disabled = false;
    btn.trigger('click');

    expect(LandingPage.methods.togglePreviewTargetDialog.callCount).to.equal(1);
    expect(LandingPage.methods.togglePreviewTargetDialog.calledWith(true)).to.equal(true);

    LandingPage.methods.togglePreviewTargetDialog = toggle;
  });

  it('should dispatch EVENTS.CREATE_PROJECT_TEMPLATE', () => {
    LandingPage.methods.sendEvent = Sinon.stub();

    const wrapper = createVue(LandingPage);
    wrapper.find('.projectTemplateBtn').trigger('click');

    expect(LandingPage.methods.sendEvent.calledWith(EVENTS.CREATE_PROJECT_TEMPLATE)).to.equal(true);
  });

  it('should dispatch EVENTS.OPEN_CAPTION_STUDIO', () => {
    LandingPage.methods.sendEvent = Sinon.stub();

    const wrapper = createVue(LandingPage);
    wrapper.find('.captionStudioBtn').trigger('click');

    expect(LandingPage.methods.sendEvent.calledWith(EVENTS.OPEN_CAPTION_STUDIO)).to.equal(true);
  });
});