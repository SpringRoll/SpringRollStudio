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
    const vm = createVue({
      el: document.createElement('div'),
      render: h => h(LandingPage)
    }).$mount();
    expect(vm.$el.querySelector('.name').textContent).to.equal('SpringRoll Studio');
  });

  it('should dispatch EVENTS.OPEN_DIALOG with parameter DIALOGS.PROJECT_LOCATION_SETTER', () => {
    LandingPage.methods.sendEvent = Sinon.stub();

    const vm = createVue({
      el: document.createElement('div'),
      render: h => h(LandingPage)
    }).$mount();
    vm.$el.querySelector('.projectLocationBtn').click();

    expect(LandingPage.methods.sendEvent.calledWith(EVENTS.OPEN_DIALOG, DIALOGS.PROJECT_LOCATION_SETTER)).to.equal(true);
  });

  it('should dispatch EVENTS.PREVIEW_GAME', () => {
    LandingPage.methods.sendEvent = Sinon.stub();

    const vm = createVue({
      el: document.createElement('div'),
      render: h => h(LandingPage)
    }).$mount();
    vm.$el.querySelector('.previewGameBtn').click();

    expect(LandingPage.methods.sendEvent.calledWith(EVENTS.PREVIEW_GAME)).to.equal(true);
  });

  it('should dispatch EVENTS.CREATE_PROJECT_TEMPLATE', () => {
    LandingPage.methods.sendEvent = Sinon.stub();

    const vm = createVue({
      el: document.createElement('div'),
      render: h => h(LandingPage)
    }).$mount();
    vm.$el.querySelector('.projectTemplateBtn').click();

    expect(LandingPage.methods.sendEvent.calledWith(EVENTS.CREATE_PROJECT_TEMPLATE)).to.equal(true);
  });

  it('should dispatch EVENTS.OPEN_CAPTION_STUDIO', () => {
    LandingPage.methods.sendEvent = Sinon.stub();

    const vm = createVue({
      el: document.createElement('div'),
      render: h => h(LandingPage)
    }).$mount();
    vm.$el.querySelector('.captionStudioBtn').click();

    expect(LandingPage.methods.sendEvent.calledWith(EVENTS.OPEN_CAPTION_STUDIO)).to.equal(true);
  });
});