<template>
  <div v-show="visible === true" class="dialog">
    <div class="content">
      <p class="heading">Create New SpringRoll Project</p>

      <div class="options">
        <div class="projectName">
          <p class="projectName-heading">Project Name</p>
          <div class="projectName-content">
            <input
              class="nameInput"
              :value="projectName"
            />
          </div>
        </div>

        <div class="projectLocation">
          <p class="projectLocation-heading">Project Location</p>
          <div class="projectLocation-content">
            <input
              class="urlInput"
              :value="projectLocation"
            />
            <button
              class="dirBrowseBtn"
              @click="onProjectLocationBtnClick()"
            >
              Browse
            </button>
          </div>
        </div>

        <div class="templateType">
          <p class="templateType-heading">Template Type</p>
          <div class="templateType-content">
            <div class="templateOption">
              <input
                id="pixiOption"
                type="radio"
                name="templateType"
                checked
                @change="setTemplateType('pixi')"
              />
              <label for="pixiOption">PIXI</label>
            </div>

            <div class="templateOption">
              <input
                id="phaserOption"
                type="radio"
                name="templateType"
                @change="setTemplateType('phaser')"
              />
              <label for="phaserOption">Phaser 3</label>
            </div>

            <div class="templateOption">
              <input
                id="createjsOption"
                type="radio"
                name="templateType"
                @change="setTemplateType('createjs')"
              />
              <label for="createjsOption">CreateJS</label>
            </div>
          </div>
        </div>
      </div>

      <div class="actions">
        <button
          id="cancelBtn"
          @click="onBtnCancelClick()"
        >
          Cancel
        </button>
        <button
          id="confirmBtn"
          @click="onBtnConfirmClick()"
        >
          Confirm
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { remote } from 'electron';
import { join } from 'path';

export default {
  props: {
    // Variables
    visible: {
      type:Boolean,
      default: false
    },

    // Callbacks
    onCancel: {
      type: Function,
      default: () => {}
    },
    onConfirm: {
      type: Function,
      default: () => {}
    }
  },

  /**
   * Data object
   */
  data: function() {
    return {
      templateType: 'pixi',
      projectName: 'New SpringRoll Game'
    };
  },

  computed: {
    ...mapState({

      /**
       * Returns the path for the current project.
       */
      projectLocation: function(state) {
        return state.projectInfo.location;
      }
    })
  },

  methods: {
    /**
     * Sets the template type.
     */
    setTemplateType: function(type) {
      this.templateType = type;
    },

    /**
     * Handler for when the project location button is clicked.
     */
    onProjectLocationBtnClick: function() {
      const urlInput = this.$el.querySelector('.urlInput');
      let defaultPath = urlInput.value;
      if (!defaultPath || defaultPath === '') {
        defaultPath = this.projectLocation;
      }
      // Open dialog in renderer process because this is a temp location
      // until the template dialog confirm action is selected.
      const result = remote.dialog.showOpenDialogSync(remote.getCurrentWindow(), {
        title: 'Select Project Location',
        properties: ['openDirectory'],
        defaultPath
      });
      // If the user selected a directory, then show it in the input field.
      if (result !== undefined) {
        urlInput.value = result[0];
      }
    },

    /**
     * Handler for clicking the cancel button.
     */
    onBtnCancelClick: function() {
      this.onCancel();
    },

    /**
     * Handler for clicking the confirm button.
     */
    onBtnConfirmClick: function() {
      const location = join(this.$el.querySelector('.urlInput').value, this.$el.querySelector('.nameInput').value);
      this.onConfirm({ type: this.templateType, location });
    }
  }
};
</script>

<style lang="scss" scoped>
.dialog {
  position: absolute;

  z-index: 100;

  width: 100%;
  height: 100%;

  display: flex;
  justify-content: center;
  align-items: center;

  background-color: rgba($color: #0e0e0e, $alpha: 0.5);

  .content {
    position: relative;

    width: 500px;
    height: 375px;

    background-color: white;

    .heading {
      text-align: center;
      margin-top: 10px;
      font-size: 18pt;
    }

    .options {
      position: absolute;

      width: 90%;
      height: 74%;

      display: flex;
      flex-direction: column;
      justify-content:space-evenly;
      align-items: center;

      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);

      .projectName {
        width: 100%;

        .projectName-heading {
          font-size: 10pt;
          padding-bottom: 5px;
        }

        .projectName-content {
          display: flex;

          width: 100%;
          height: 30px;

          .nameInput {
            width: 100%;
            margin-right: 10px;
          }
        }
      }

      .projectLocation {
        width: 100%;

        .projectLocation-heading {
          font-size: 10pt;
          padding-bottom: 5px;
        }

        .projectLocation-content {
          display: flex;

          width: 100%;
          height: 30px;

          .urlInput {
            width: 75%;
            margin-right: 10px;
          }

          .dirBrowseBtn {
            flex-grow: 1;
          }
        }
      }

      .templateType {
        display: flex;
        flex-direction: column;
        align-items: center;

        width: 100%;
        height: 100px;

        .templateType-heading {
          font-size: 10pt;
          padding-bottom: 5px;
        }

        .templateType-content {
          width: 90%;
          height: 100%;

          flex-grow: 1;
          border: 1px solid black;
          border-radius: 5px;

          display: flex;
          justify-content: center;
          align-items: center;

          .templateOption > input {
            margin-right: 5px;
          }

          > .templateOption + .templateOption {
            margin-left: 50px;
          }
        }
      }
    }

    .actions {
      position: absolute;

      display: flex;
      justify-content: center;
      align-items: center;

      width: 220px;
      height: 40px;

      bottom: 0;
      right: 0;
    }

    .actions > button {
      width: 100px;
      height: 30px;
    }

    .actions > button + button {
      margin-left: 10px;
    }
  }
}
</style>