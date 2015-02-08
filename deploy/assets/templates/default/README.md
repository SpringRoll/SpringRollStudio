# SpringRollTemplate

Default template for the [SpringRoll Studio](https://github.com/SpringRoll/SpringRollStudio) application.

## Extending

You create your own Template based on the default template. Create **springroll-template.json** within your project (example below).

```js
{
	// The human-readible name of the template
	"name" : "Custom Template",

	// A unique bundle id for the template
	"id" : "com.example.customtemplate",

	// The version of the template
	"version" : "1.0.0",

	// Tagged releases will get auto-updated
	// from Github if the username/repo is set
	"github": "username/CustomTemplate",

	// This is required to extend!
	"extend": "io.springroll.default"
}
```