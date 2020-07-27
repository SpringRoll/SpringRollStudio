module.exports = {

  pluginOptions: {

    electronBuilder: {

      builderOptions: {
        productName: "SpringrollStudio",
        appId: "io.springroll.studio",
        artifactName: "${productName}-${os}-${version}-Setup.${ext}",
        directories: {
          output: "build"
        },
        dmg: {
          contents: [
            { x: 410, y: 150, type: "link", path: "/Applications" },
            { x: 130, y: 150, type: "file" }
          ]
        },
        mac: {
          icon: "build/icons/icon.icns"
        },
        win: {
          icon: "build/icons/icon.ico"
        }
      }
    }
  }
};