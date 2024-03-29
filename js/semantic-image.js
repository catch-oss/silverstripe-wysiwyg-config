/* global tinymce, window */

/* eslint-disable
  no-param-reassign,
  func-names
*/

function n(t) {
    return t && t.__esModule ? t.default : t
}

var _jquery = jQuery;
var _i18n = i18n;
var _react = React;
var _reactDom = ReactDom;
var _Injector = Injector;
var _InsertMediaModal = n(InsertMediaModal);
var _ShortcodeSerialiser = n(ShortcodeSerialiser);
var InjectableInsertMediaModal = _Injector.loadComponent(_InsertMediaModal);

var semanticimagefilter = 'figure[data-shortcode="semanticimage"]';

(function () {
    var semanticimage = {
        /**
         * Initilise this plugin
         *
         * @param {Object} ed
         */
        init: function init(ed) {
            var parent_self = this;

            var insertTitle = i18n._t(
                "AssetAdmin.INSERT_FROM_FILES",
                "Insert from Files"
            );

            var editTitle = i18n._t("AssetAdmin.EDIT_IMAGE", "Edit image");

            var contextTitle = i18n._t("AssetAdmin.FILE", "File");

            ed.addButton("semanticimage", {
                title: insertTitle,
                icon: "image",
                cmd: "semanticimage",
                stateSelector: semanticimagefilter
            });
            ed.addMenuItem("semanticimage", {
                text: contextTitle,
                icon: "image",
                cmd: "semanticimage"
            });
            ed.addButton("semanticimageedit", {
                title: editTitle,
                icon: "editimage",
                cmd: "semanticimage"
            });

            ed.addContextToolbar(function (img) {
                // console.log(ed.dom.is(img, semanticimagefilter), 'is-it');
                return ed.dom.is(img, semanticimagefilter);
            }, "alignleft aligncenter alignright | semanticimageedit");
            ed.addCommand("semanticimage", function () {
                // See HtmlEditorField.js
                jQuery("#" + ed.id)
                    .entwine("ss")
                    .openMediaDialog();
            }); // Replace the mceAdvImage and mceImage commands with the semanticimage command

            ed.on("BeforeExecCommand", function (e) {
                var cmd = e.command;
                var ui = e.ui;
                var val = e.value;

                if (cmd === "mceAdvImage" || cmd === "mceImage") {
                    e.preventDefault();
                    ed.execCommand("semanticimage", ui, val);
                }
            });
            ed.on("SaveContent", function (o) {
                console.log('save content fired');
                var content = jQuery(o.content); // Transform [image] shortcodes

                content
                    .find(semanticimagefilter)
                    .add(content.filter(semanticimagefilter))
                    .each(function () {
                        var el = jQuery(this);

                        var properties = {
                            // Requires server-side preprocessing of HTML+shortcodes in HTMLValue
                            src: el.attr("src"),
                            id: el.data("id"),
                            width: el.attr("width"),
                            height: el.attr("height"),
                            class: el.attr("class"),
                            // don't save caption, since that's in the containing element
                            title: el.attr("title"),
                            alt: el.attr("alt")
                        };

                        console.log('saved content props', properties);


                        var shortCode = _ShortcodeSerialiser.serialise({
                            name: "semanticimage",
                            properties: properties,
                            wrapped: false
                        });
                        el.replaceWith(shortCode);
                    }); // Insert outerHTML in order to retain all nodes incl. <script>
                // tags which would've been filtered out with jQuery.html().
                // Note that <script> tags might be sanitized separately based on editor config.

                o.content = "";
                content.each(function () {
                    if (this.outerHTML !== undefined) {
                        o.content += this.outerHTML;
                    }
                });
            });
            ed.on("BeforeSetContent", function (o) {
                var content = o.content;
                var match = _ShortcodeSerialiser.match("semanticimage", false, content);

                while (match) {

                    // var attrs = match.properties;
                    // var attrs = this.getAttributes();
                    // var extraData = this.getExtraData(); // Find the element we are replacing - either the img, it's wrapper parent,
                    // var settings = editor.getConfig().wysiswg_semantic_image;

                    // var classes = attrs.class.split(/\s+/).map(function(klass) {
                    //     return klass + " " + settings.classes[klass] || "";
                    // }).join(' ');

                    // var replacerbits = Object.assign({
                    //     classes : "captionImage Image " + classes,
                    //     caption : extraData.CaptionText ? extraData.CaptionText : ""
                    // }, attrs);

                    // var container = settings.template.replace(/\{\{\s*(\S*)\s*\}\}/g, function(a,b){
                    //     return replacerbits[b] ? replacerbits[b] : '';
                    // });

                    var el = jQuery("<img/>")
                        .attr(
                            Object.assign({}, {
                                "id": undefined,
                                "data-id": match.properties.id,
                                "data-shortcode": "semanticimage"
                            })
                        )
                        .addClass("ss-htmleditorfield-file image");
                    content = content.replace(
                        match.original,
                        jQuery("<figure/>")
                            .append(el)
                            .html()
                    ); // Get next match

                    match = _ShortcodeSerialiser.match("semanticimage", false, content);
                }

                o.content = content;
            });
        }
    }; // Adds the plugin class to the list of available TinyMCE plugins

    tinymce.PluginManager.add("semanticimage", function (editor) {
        return semanticimage.init(editor);
    });
})();

jQuery.entwine("ss", function ($) {
    // this is required because the React version of e.preventDefault() doesn't work
    // this is to stop React Tabs from navigating the page
    $(
        ".insert-media-react__dialog-wrapper .nav-link, " +
        ".insert-media-react__dialog-wrapper .breadcrumb__container a"
    ).entwine({
        onclick: function onclick(e) {
            return e.preventDefault();
        }
    });
    $(".js-injector-boot #insert-media-react__dialog-wrapper").entwine({
        Element: null,
        Data: {},
        onunmatch: function onunmatch() {
            // solves errors given by ReactDOM "no matched root found" error.
            this._clearModal();
        },
        _clearModal: function _clearModal() {
            ReactDom.unmountComponentAtNode(this[0]); // this.empty();
        },
        open: function open() {
            this._renderModal(true);
        },
        close: function close() {
            this._renderModal(false);
        },

        /**
         * Renders the react modal component
         *
         * @param {boolean} isOpen
         * @private
         */
        _renderModal: function _renderModal(isOpen) {
            var _this = this;

            var handleHide = function handleHide() {
                return _this.close();
            };

            var handleInsert = function handleInsert() {
                return _this._handleInsert.apply(_this, arguments);
            };

            var attrs = this.getOriginalAttributes();
            var selection = tinymce.activeEditor.selection;
            var selectionContent = selection.getContent() || "";
            var tagName = selection.getNode().tagName; // Unsupported media insertion will use insert link form instead
            // treat image tag selection as blank content

            var requireLinkText =
                tagName !== "A" &&
                (tagName === "IMG" || selectionContent.trim() === "");
            delete attrs.url; // create/update the react component

            ReactDom.render(
                React.createElement(InjectableInsertMediaModal, {
                    title: false,
                    type: "insert-media",
                    isOpen: isOpen,
                    onInsert: handleInsert,
                    onClosed: handleHide,
                    bodyClassName: "modal__dialog",
                    className: "insert-media-react__dialog-wrapper",
                    requireLinkText: requireLinkText,
                    fileAttributes: attrs
                }),
                this[0]
            );
        },

        /**
         * Handles inserting the selected file in the modal
         *
         * @param {object} data
         * @param {object} file
         * @returns {Promise}
         * @private
         */
        _handleInsert: function _handleInsert(data, file) {
            var result = false;
            this.setData(Object.assign({}, data, file)); // Sometimes AssetAdmin.js handleSubmitEditor() can't find the file
            // @todo Ensure that we always return a file for any valid ID
            // in case of any errors, better to catch them than let them go silent

            try {
                var category = null;

                if (file) {
                    category = file.category;
                } else {
                    category = "image";
                }

                switch (category) {
                    case "image":
                        result = this.insertImage();
                        break;

                    case "semanticimage":
                        result = this.insertImage();
                        break;

                    default:
                        result = this.insertFile();
                }
            } catch (e) {
                this.statusMessage(e, "bad");
            }
            // if result is a promise then just return the promise
            if (typeof result == 'object' && $result.hasOwnProperty('then')) {
                return result;
            }
            // else it should be a bool 
            if (result) {
                this.close();
            }
            // so return a empty promise that resolves it's self 
            return Promise.resolve();
        },

        /**
         * Find the selected node and get attributes associated to attach the data to the form
         *
         * @returns {object}
         */
        getOriginalAttributes: function getOriginalAttributes() {


            var $field = this.getElement();

            if (!$field) {
                return {};
            }

            var editor = $field.getEditor();
            var settings = editor.getConfig().wysiswg_semantic_image;

            var node = $field.getEditor().getSelectedNode();

            if (!node) {
                return {};
            }

            var $node = $(node);
            var $parent = $node; // Handler for if the selection is a link instead of image media

            if (!$node.is(settings.selectors.wrapper)) {
                var p = $node.parents(settings.selectors.wrapper);
                if (p) {
                    $parent = p;
                }
            }

            var hrefParts = ($node.attr("href") || "").split("#");
            if (hrefParts[0]) {
                // check if file is safe
                var shortcode = _ShortcodeSerialiser.match(
                    "file_link",
                    false,
                    hrefParts[0]
                );

                if (shortcode) {
                    return {
                        ID: shortcode.properties.id
                            ? parseInt(shortcode.properties.id, 10)
                            : 0,
                        Anchor: hrefParts[1] || "",
                        Description: $node.attr("title"),
                        TargetBlank: !!$node.attr("target")
                    };
                }
            }

            var $caption = $parent.find(settings.selectors.caption);
            var attr = {
                url: $node.attr("src"),
                AltText: $node.attr("alt"),
                Width: $node.attr("width"),
                Height: $node.attr("height"),
                TitleTooltip: $node.attr("title"),
                Alignment: this.findPosition($parent.attr("class")),
                Caption: $caption.text(),
                ID: $parent.attr("data-id")
            }; // parse certain attributes to integer value

            ["Width", "Height", "ID"].forEach(function (item) {
                attr[item] =
                    typeof attr[item] === "string" ? parseInt(attr[item], 10) : null;
            });
            return attr;
        },

        /**
         * Calculate placement from css class
         */
        findPosition: function findPosition(cssClass) {
            var alignments = ["leftAlone", "center", "rightAlone", "left", "right"];

            if (typeof cssClass !== "string") {
                return "";
            }

            var classes = cssClass.split(" ");
            return alignments.find(function (alignment) {
                return classes.indexOf(alignment) > -1;
            });
        },

        /**
         * Get html attributes from the Form data
         *
         * @returns {object}
         */
        getAttributes: function getAttributes() {
            var data = this.getData();
            var attribs = {
                src: data.url,
                alt: data.AltText,
                width: data.Width,
                height: data.Height,
                title: data.TitleTooltip,
                class: data.Alignment,
                "data-id": data.ID,
                "data-shortcode": "semanticimage"
            };

            return attribs;
        },

        /**
         * Get extra data not part of the actual element we're adding/modifying (e.g. Caption)
         * @returns {object}
         */
        getExtraData: function getExtraData() {
            var data = this.getData();

            return {
                CaptionText: data && data.Caption || data && data.DefaultCaptionText
            };
        },

        /**
         * Generic handler for inserting a file
         *
         * NOTE: currently not supported
         *
         * @returns {boolean} success
         */
        insertFile: function insertFile() {

            var data = this.getData();
            var editor = this.getElement().getEditor();
            var $node = $(editor.getSelectedNode());
            var shortcode = _ShortcodeSerialiser.serialise(
                {
                    name: "file_link",
                    properties: {
                        id: data.ID
                    }
                },
                true
            );
            var selection = tinymce.activeEditor.selection;
            var selectionContent = selection.getContent() || "";
            var linkText = selectionContent || data.Text || data.filename; // if link was highlighted, then we don't want to place more text inside that text

            if ($node.is("a") && $node.html()) {
                linkText = "";
            }

            var linkAttributes = {
                href: shortcode,
                target: data.TargetBlank ? "_blank" : "",
                title: data.Description
            }; // if the selection is an image, then replace it

            if ($node.is("img")) {
                // selectionContent is the image html, so we don't want that
                linkText = data.Text || data.filename;
                var newLink = $("<a />")
                    .attr(linkAttributes)
                    .text(linkText);
                $node.replaceWith(newLink);
                editor.addUndo();
                editor.repaint();
            } else {
                this.insertLinkInEditor(linkAttributes, linkText);
            }

            return true;
        },

        /**
         * Handler for inserting an image
         *
         * @returns {boolean} success
         */
        insertImage: function insertImage() {

            var $field = this.getElement();

            if (!$field) {
                return false;
            }

            var editor = $field.getEditor();

            if (!editor) {
                return false;
            }

            var node = $(editor.getSelectedNode()); // Get the attributes & extra data

            var attrs = this.getAttributes();
            var that = this;

            return new Promise(function (resolve, reject) {

                // lets get a re sampled image.
                $.get('/image-resample/resample',
                    {
                        id: attrs['data-id'] || 0,
                        width: attrs['width'] || 0,
                        height: attrs['height'] || 0,
                    },
                    function (resampledImgSrc) {

                        if (resampledImgSrc) {
                            attrs.src = resampledImgSrc;
                        }


                        var extraData = that.getExtraData(); // Find the element we are replacing - either the img, it's wrapper parent,
                        var settings = editor.getConfig().wysiswg_semantic_image;

                        var classes = attrs.class.split(/\s+/).map(function (klass) {
                            return klass + " " + settings.classes[klass] || "";
                        }).join(' ');

                        var replacerbits = Object.assign({
                            classes: "captionImage Image " + classes,
                            caption: extraData.CaptionText ? extraData.CaptionText : ""
                        }, attrs);

                        var container = settings.template.replace(/\{\{\s*(\S*)\s*\}\}/g, function (a, b) {
                            return replacerbits[b] ? replacerbits[b] : '';
                        });

                        container = $(container);
                        container.find('img').addClass("ss-htmleditorfield-file semanticimage image");
                        // var

                        // or nothing (if creating)

                        var replacee = node && node.is("img,a") ? node : null;
                        if (replacee && replacee.parents(settings.selectors.wrapper).is(".captionImage"))
                            replacee = replacee.parents(settings.selectors.wrapper); // Find the img node - either the existing img or a new one, and update it

                        var replacer = container; // If we're replacing something, and it's not with itself, do so

                        if (replacee) {
                            replacee.replaceWith(replacer);
                        }

                        if (!replacee) {
                            // Otherwise insert the whole HTML content
                            editor.repaint();
                            editor.insertContent(
                                $("<div />")
                                    .append(container)
                                    .html(),
                                {
                                    skip_undo: 1
                                }
                            );
                        }


                        editor.addUndo();
                        editor.repaint();
                        that.close();

                        resolve();

                    });
            });
        },

        /**
         * Pop up a status message if required to notify the user what is happening
         *
         * @param text
         * @param type
         */
        statusMessage: function statusMessage(text, type) {
            var content = $("<div/>")
                .text(text)
                .html(); // Escape HTML entities in text

            $.noticeAdd({
                text: content,
                type: type,
                stayTime: 5000,
                inEffect: {
                    left: "0",
                    opacity: "show"
                }
            });
        }
    });
});
