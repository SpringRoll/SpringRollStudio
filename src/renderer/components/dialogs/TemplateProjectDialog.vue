<template>
  <div v-show="visible === true" class="dialog">
    <div class="content">
      <p class="heading">Create New SpringRoll Project</p>

      <div class="options">
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

  computed: {
    ...mapState({

      projectLocation: function(state) {
        return state.projectInfo.location;
      }
    })
  },

  methods: {
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
        title: "Select Project Location",
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
      this.onConfirm({});
    }
  }
}
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
    height: 400px;

    background-color: white;

    .heading {
      text-align: center;
      margin-top: 10px;
      font-size: 18pt;
    }

    .options {
      position: absolute;

      width: 90%;
      height: 300px;

      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;

      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);

      .projectLocation {
        width: 100%;

        .projectLocation-heading {

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