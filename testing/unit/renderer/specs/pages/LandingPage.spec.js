import { createVue } from '../../utils/VueUtils';
import { EVENTS, DIALOGS } from '@/contants';
import LandingPage from '@/renderer/components/pages/LandingPage.vue';

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

  it('should dispatch EVENTS.OPEN_DIALOG with parameter DIALOGS.PROJECT_LOCATION_SETTER', (done) => {
    LandingPage.methods.sendEvent = (event, type) => {
      expect(event).to.equal(EVENTS.OPEN_DIALOG);
      expect(type).to.equal(DIALOGS.PROJECT_LOCATION_SETTER);
      done();
    };

    const vm = createVue({
      el: document.createElement('div'),
      render: h => h(LandingPage)
    }).$mount();
    vm.$el.querySelector('.projectLocationBtn').click();
  });

  it('should dispatch EVENTS.PREVIEW_GAME', (done) => {
    LandingPage.methods.sendEvent = (event) => {
      expect(event).to.equal(EVENTS.PREVIEW_GAME);
      done();
    };

    const vm = createVue({
      el: document.createElement('div'),
      render: h => h(LandingPage)
    }).$mount();
    vm.$el.querySelector('.previewGameBtn').click();
  });

  it('should dispatch EVENTS.CREATE_PROJECT_TEMPLATE', (done) => {
    LandingPage.methods.sendEvent = (event) => {
      expect(event).to.equal(EVENTS.CREATE_PROJECT_TEMPLATE);
      done();
    };

    const vm = createVue({
      el: document.createElement('div'),
      render: h => h(LandingPage)
    }).$mount();
    vm.$el.querySelector('.projectTemplateBtn').click();
  });

  it('should dispatch EVENTS.OPEN_CAPTION_STUDIO', (done) => {
    LandingPage.methods.sendEvent = (event) => {
      expect(event).to.equal(EVENTS.OPEN_CAPTION_STUDIO);
      done();
    };

    const vm = createVue({
      el: document.createElement('div'),
      render: h => h(LandingPage)
    }).$mount();
    vm.$el.querySelector('.captionStudioBtn').click();
  });
});