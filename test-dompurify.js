const createDOMPurify = require("isomorphic-dompurify");
const DOMPurify = createDOMPurify();

console.log("Basic text:", DOMPurify.sanitize("<p>Hello world</p>"));
console.log(
	"Script tag:",
	DOMPurify.sanitize('<script>alert("test")</script>')
);
console.log(
	"Script with div:",
	DOMPurify.sanitize("<div>Safe</div><script>bad</script>")
);

// Test with our specific configuration
const result = DOMPurify.sanitize(
	'<div>Safe content</div><script>alert("XSS")</script>',
	{
		FORBID_ATTR: [
			"onclick",
			"onload",
			"onerror",
			"onmouseover",
			"onmouseout",
			"onfocus",
			"onblur",
			"onchange",
			"onsubmit",
			"onreset",
			"onkeydown",
			"onkeyup",
			"onkeypress",
			"style",
			"formaction",
			"form",
			"formenctype",
			"formmethod",
			"formnovalidate",
			"formtarget",
			"action",
			"method",
			"enctype",
			"target",
		],
		ALLOWED_ATTR: [
			"href",
			"src",
			"alt",
			"title",
			"class",
			"id",
			"width",
			"height",
			"aria-label",
			"aria-describedby",
			"role",
			"tabindex",
		],
		ALLOWED_TAGS: [
			"p",
			"br",
			"strong",
			"em",
			"u",
			"i",
			"b",
			"ul",
			"ol",
			"li",
			"h1",
			"h2",
			"h3",
			"h4",
			"h5",
			"h6",
			"blockquote",
			"div",
			"span",
			"a",
			"img",
			"table",
			"tr",
			"td",
			"th",
			"thead",
			"tbody",
		],
		ALLOW_DATA_ATTR: false,
		ALLOW_UNKNOWN_PROTOCOLS: false,
		RETURN_DOM: false,
		RETURN_DOM_FRAGMENT: false,
		RETURN_TRUSTED_TYPE: false,
		SANITIZE_DOM: true,
		KEEP_CONTENT: false,
		ALLOWED_URI_REGEXP:
			/^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.-]+(?:[^a-z+.-:]|$))/i,
	}
);

console.log("Our config result:", result);
