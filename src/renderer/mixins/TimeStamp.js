export default {
  computed: {
    minutes: {
      get: function() {
        return this.padZero(Math.floor(this.time / (60 * 1000)).toFixed(0));
      },
      set: function(e) {
        this.setTime({ minutes: e });
      }
    },
    seconds: {
      get: function() {
        return this.padZero(
          (((this.time % (60 * 1000)) / 1000) | 0).toString()
        );
      },
      set: function(e) {
        this.setTime({ seconds: e });
      }
    },
    milliseconds: {
      get: function() {
        return this.padZero(((this.time % 1000) / 10).toFixed(0).slice(0, 2));
      },
      set: function(e) {
        this.setTime({ milliseconds: e });
      }
    }
  },
  methods: {
    padZero(s) {
      return 2 > s.length ? `0${s}` : s;
    },
    setTime({
      minutes = Number(this.minutes),
      seconds = Number(this.seconds),
      milliseconds = Number(this.milliseconds)
    } = {}) {
      this.time = minutes * 60 * 1000 + seconds * 1000 + milliseconds * 10;
    }
  }
};
